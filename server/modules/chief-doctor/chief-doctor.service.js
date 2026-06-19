import Appointment from '../../models/Appointment.model.js';
import AuditLog from '../../models/AuditLog.model.js';
import ClinicalIncident from '../../models/ClinicalIncident.model.js';
import Department from '../../models/Department.model.js';
import DischargeSummary from '../../models/DischargeSummary.model.js';
import Doctor from '../../models/Doctor.model.js';
import EHR from '../../models/EHR.model.js';
import LabResult from '../../models/LabResult.model.js';
import MedicalCertificate from '../../models/MedicalCertificate.model.js';
import MedicalCouncil from '../../models/MedicalCouncil.model.js';
import Patient from '../../models/Patient.model.js';
import User from '../../models/User.model.js';
import Visit from '../../models/Visit.model.js';
import ApiError from '../../utils/ApiError.js';
import logAction from '../../utils/auditLogger.js';
import { createNotification } from '../notifications/notifications.service.js';
import { approveManualResult, listManualResults } from '../lab/lab.service.js';

const pageArgs = ({ page = 1, limit = 20 } = {}) => {
  const pg = Math.max(1, Number(page) || 1);
  const lim = Math.min(100, Math.max(1, Number(limit) || 20));
  return { pg, lim, skip: (pg - 1) * lim };
};
const dayBounds = () => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(); end.setHours(23, 59, 59, 999);
  return { start, end };
};
const dateFilter = ({ dateFrom, dateTo } = {}, field = 'createdAt') => {
  if (!dateFrom && !dateTo) return {};
  const range = {};
  if (dateFrom) range.$gte = new Date(dateFrom);
  if (dateTo) { const end = new Date(dateTo); end.setHours(23,59,59,999); range.$lte = end; }
  return { [field]: range };
};
const doctorPopulate = { path: 'doctorId', populate: { path: 'userId', select: 'fullName email phone' }, select: 'userId specialization department departmentId isActive isAvailable' };
const patientPopulate = { path: 'patientId', populate: { path: 'userId', select: 'fullName phone' }, select: 'userId patientId' };

export const dashboard = async () => {
  const { start, end } = dayBounds();
  const [
    activeDoctors, todayAppointments, waiting, completed, pendingDocuments,
    pendingLabs, criticalLabs, activeCouncils, appointments, criticalResults,
    documents, councils, activities,
  ] = await Promise.all([
    Doctor.countDocuments({ isActive: true }),
    Appointment.countDocuments({ date: { $gte: start, $lte: end } }),
    Appointment.countDocuments({ date: { $gte: start, $lte: end }, status: 'waiting' }),
    Appointment.countDocuments({ date: { $gte: start, $lte: end }, status: 'completed' }),
    Promise.all([
      EHR.countDocuments({ approvalStatus: 'submitted', isActive: true }),
      DischargeSummary.countDocuments({ approvalStatus: 'submitted' }),
      MedicalCertificate.countDocuments({ approvalStatus: 'submitted' }),
    ]).then(v => v.reduce((a,b) => a+b, 0)),
    LabResult.countDocuments({ status: 'completed', protocolNo: { $ne: null } }),
    LabResult.countDocuments({ status: 'completed', results: { $elemMatch: { status: 'critical' } } }),
    MedicalCouncil.countDocuments({ status: { $in: ['scheduled','in_progress'] } }),
    Appointment.find({ date: { $gte: start, $lte: end } }).populate(patientPopulate).populate(doctorPopulate).sort({ startTime: 1 }).limit(12),
    LabResult.find({ results: { $elemMatch: { status: 'critical' } } }).sort({ createdAt: -1 }).limit(6).select('protocolNo patientFullName testName status createdAt'),
    EHR.find({ approvalStatus: 'submitted', isActive: true }).sort({ createdAt: -1 }).limit(6).populate(patientPopulate).populate(doctorPopulate),
    MedicalCouncil.find({ status: { $in: ['scheduled','in_progress'] } }).sort({ scheduledAt: 1 }).limit(6).populate(patientPopulate),
    AuditLog.find({ resourceType: { $in: ['LabResult','Appointment','EHR','DischargeSummary','MedicalCertificate','MedicalCouncil','ClinicalIncident'] } }).sort({ createdAt: -1 }).limit(8).populate('userId','fullName role'),
  ]);
  const departmentFlow = await Appointment.aggregate([
    { $match: { date: { $gte: start, $lte: end } } },
    { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    { $group: { _id: '$doctor.department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }, { $limit: 10 },
  ]);
  return { stats: { activeDoctors, todayAppointments, waiting, completed, pendingDocuments, pendingLabs, criticalLabs, activeCouncils }, appointments, departmentFlow, criticalResults, documents, councils, activities };
};

export const doctors = async (query) => {
  const { pg, lim, skip } = pageArgs(query);
  const filter = {};
  if (query.department) filter.department = new RegExp(query.department, 'i');
  if (query.status) filter.isActive = query.status === 'active';
  const userFilter = query.search ? { $or: [{ fullName: new RegExp(query.search,'i') }, { email: new RegExp(query.search,'i') }] } : {};
  const userIds = query.search ? await User.find(userFilter).distinct('_id') : null;
  if (userIds) filter.userId = { $in: userIds };
  const [items, total] = await Promise.all([
    Doctor.find(filter).populate('userId','fullName email phone role').populate('departmentId','name').skip(skip).limit(lim).sort({ createdAt:-1 }).lean(),
    Doctor.countDocuments(filter),
  ]);
  const ids = items.map(i => i._id);
  const { start, end } = dayBounds();
  const stats = await Appointment.aggregate([{ $match:{ doctorId:{ $in:ids }, date:{ $gte:start,$lte:end } } },{ $group:{ _id:'$doctorId', today:{ $sum:1 }, completed:{ $sum:{ $cond:[{$eq:['$status','completed']},1,0] } }, cancelled:{ $sum:{ $cond:[{$eq:['$status','cancelled']},1,0] } } } }]);
  const map = Object.fromEntries(stats.map(s => [String(s._id),s]));
  return { items: items.map(i => ({ ...i, clinicalStats: map[String(i._id)] || { today:0,completed:0,cancelled:0 } })), total, page:pg, limit:lim };
};

export const departments = async () => {
  const items = await Department.find().populate({ path:'headDoctorId', populate:{ path:'userId', select:'fullName' } }).sort({ order:1 }).lean();
  const doctorCounts = await Doctor.aggregate([{ $match:{ isActive:true } },{ $group:{ _id:'$departmentId', count:{ $sum:1 } } }]);
  const map = Object.fromEntries(doctorCounts.map(x => [String(x._id),x.count]));
  return items.map(i => ({ ...i, activeDoctors: map[String(i._id)] || 0 }));
};

export const appointments = async (query) => {
  const { pg, lim, skip } = pageArgs(query);
  const filter = { ...dateFilter(query,'date') };
  ['status','doctorId','priority'].forEach(k => { if(query[k]) filter[k]=query[k]; });
  const [items,total] = await Promise.all([
    Appointment.find(filter).populate(patientPopulate).populate(doctorPopulate).sort({ date:-1,startTime:1 }).skip(skip).limit(lim),
    Appointment.countDocuments(filter),
  ]);
  return { items,total,page:pg,limit:lim };
};

export const reassignAppointment = async (id, { doctorId, reason }, userId, req) => {
  if (!doctorId || !reason?.trim()) throw new ApiError(400,'Doctor and reason are required');
  const appointment = await Appointment.findById(id);
  const next = await Doctor.findOne({ _id:doctorId, isActive:true, isAvailable:true });
  const current = appointment && await Doctor.findById(appointment.doctorId);
  if (!appointment) throw new ApiError(404,'Appointment not found');
  if (!next) throw new ApiError(404,'Available doctor not found');
  if (current?.departmentId && next.departmentId && String(current.departmentId)!==String(next.departmentId)) throw new ApiError(400,'Doctor must belong to the same department');
  const conflict = await Appointment.exists({ _id:{ $ne:id }, doctorId, date:appointment.date, status:{ $nin:['cancelled','missed','completed'] }, startTime:{ $lt:appointment.endTime }, endTime:{ $gt:appointment.startTime } });
  if (conflict) throw new ApiError(409,'Doctor is unavailable for this time');
  const fromDoctorId = appointment.doctorId;
  appointment.doctorId = doctorId;
  appointment.reassignmentHistory.push({ fromDoctorId, toDoctorId:doctorId, reason:reason.trim(), reassignedBy:userId });
  if (appointment.reassignmentHistory.length > 100) appointment.reassignmentHistory = appointment.reassignmentHistory.slice(-100);
  await appointment.save();
  const users = await Doctor.find({ _id:{ $in:[fromDoctorId,doctorId] } }).select('userId');
  await Promise.all(users.map(d => createNotification({ userId:d.userId,title:'Randevu yönləndirildi',message:reason.trim(),type:'appointment',link:'/bas-hekim/randevular' })));
  logAction({ userId, action:'CHIEF_APPOINTMENT_REASSIGN', resourceType:'Appointment', resourceId:appointment._id, description:'Clinical appointment reassigned', req, metadata:{ fromDoctorId,toDoctorId:doctorId,reason:reason.trim() } });
  return appointment.populate(patientPopulate).then(x => x.populate(doctorPopulate));
};

export const labResults = query => listManualResults(query);
export const approveLab = async (id,userId) => {
  const result = await approveManualResult(id,userId,true);
  if (result.patientId) {
    const patient = await Patient.findById(result.patientId).select('userId');
    if (patient?.userId) await createNotification({ userId:patient.userId,title:'Laboratoriya nəticəniz hazırdır',message:`${result.protocolNo} nömrəli nəticə təsdiqləndi.`,type:'lab',link:'/e-netice' });
  }
  return result;
};
export const returnLab = async (id, reason, userId, req) => {
  if (!reason?.trim()) throw new ApiError(400,'Reason is required');
  const result = await LabResult.findOne({ _id:id, status:'completed' });
  if (!result) throw new ApiError(400,'Only completed result can be returned');
  result.isPublicVisible=false; result.internalNote=[result.internalNote,`RETURN: ${reason.trim()}`].filter(Boolean).join('\n').slice(0,2000);
  await result.save();
  if (result.labTechnicianId) await createNotification({ userId:result.labTechnicianId,title:'Laboratoriya nəticəsi geri qaytarıldı',message:reason.trim(),type:'lab',link:'/lab' });
  logAction({ userId,action:'CHIEF_LAB_RETURN',resourceType:'LabResult',resourceId:result._id,description:'Lab result returned for correction',req,metadata:{reason:reason.trim()} });
  return result;
};

const documentModels = { ehr:EHR, discharge:DischargeSummary, certificate:MedicalCertificate };
export const documents = async (query) => {
  const status = query.status || 'submitted';
  const [ehr,discharges,certificates] = await Promise.all([
    EHR.find({ isActive:true, approvalStatus:status }).populate(patientPopulate).populate(doctorPopulate).sort({createdAt:-1}).limit(50),
    DischargeSummary.find({ approvalStatus:status }).populate(patientPopulate).populate({path:'dischargingDoctor',populate:{path:'userId',select:'fullName'}}).sort({createdAt:-1}).limit(50),
    MedicalCertificate.find({ approvalStatus:status }).populate(patientPopulate).populate({path:'doctorId',populate:{path:'userId',select:'fullName'}}).sort({createdAt:-1}).limit(50),
  ]);
  return { ehr,discharges,certificates };
};
export const reviewDocument = async (kind,id,{action,reason},userId,req) => {
  const Model=documentModels[kind]; if(!Model) throw new ApiError(400,'Invalid document type');
  const doc=await Model.findById(id); if(!doc) throw new ApiError(404,'Document not found');
  if(doc.approvalStatus!=='submitted') throw new ApiError(400,'Only submitted document can be reviewed');
  if(action==='return' && !reason?.trim()) throw new ApiError(400,'Reason is required');
  doc.approvalStatus=action==='approve'?'approved':'returned'; doc.approvedBy=action==='approve'?userId:null; doc.approvedAt=action==='approve'?new Date():null; doc.returnReason=action==='return'?reason.trim():'';
  await doc.save();
  const doctorRef = kind==='ehr' ? doc.doctorId : kind==='discharge' ? doc.dischargingDoctor : doc.doctorId;
  if (doctorRef) {
    const doctor = await Doctor.findById(doctorRef).select('userId');
    if (doctor?.userId) await createNotification({
      userId:doctor.userId,
      title:action==='approve'?'Tibbi sənəd təsdiqləndi':'Tibbi sənəd geri qaytarıldı',
      message:action==='approve'?'Sənəd Baş həkim tərəfindən təsdiqləndi.':reason.trim(),
      type:'general', link:'/bas-hekim/tibbi-senedler',
    });
  }
  const actionName=action==='approve'?'CHIEF_DOCUMENT_APPROVE':'CHIEF_DOCUMENT_RETURN';
  logAction({userId,action:actionName,resourceType:Model.modelName,resourceId:doc._id,description:`${Model.modelName} ${action}`,req,metadata:{reason:doc.returnReason}});
  return doc;
};

export const incidents = async query => {
  const {pg,lim,skip}=pageArgs(query); const filter={}; if(query.status)filter.status=query.status;if(query.priority)filter.priority=query.priority;
  const [items,total]=await Promise.all([ClinicalIncident.find(filter).populate(patientPopulate).populate({path:'responsibleDoctorId',populate:{path:'userId',select:'fullName'}}).populate('departmentId','name').sort({createdAt:-1}).skip(skip).limit(lim),ClinicalIncident.countDocuments(filter)]);
  return {items,total,page:pg,limit:lim};
};
export const createIncident = async (data,userId,req) => {
  if (!data.patientId || !data.title?.trim() || !data.type) throw new ApiError(400,'Patient, title and incident type are required');
  if (!await Patient.exists({_id:data.patientId})) throw new ApiError(404,'Patient not found');
  const doc=await ClinicalIncident.create({...data,title:data.title.trim()});
  logAction({userId,action:'CLINICAL_INCIDENT_CREATE',resourceType:'ClinicalIncident',resourceId:doc._id,description:doc.title,req});return doc;
};
export const updateIncident = async (id,data,userId,req) => {
  const doc=await ClinicalIncident.findById(id);if(!doc)throw new ApiError(404,'Incident not found');
  ['status','priority','responsibleDoctorId'].forEach(k=>{if(data[k]!==undefined)doc[k]=data[k]});
  if(data.note?.trim()){doc.notes.push({text:data.note.trim(),authorId:userId});if(doc.notes.length>100)doc.notes=doc.notes.slice(-100);}
  if(data.status==='resolved'){doc.reviewedBy=userId;doc.reviewedAt=new Date();}
  await doc.save();logAction({userId,action:'CLINICAL_INCIDENT_UPDATE',resourceType:'ClinicalIncident',resourceId:doc._id,description:'Clinical incident updated',req,metadata:data});return doc;
};

export const councils = async query => {
  const {pg,lim,skip}=pageArgs(query);const filter={};if(query.status)filter.status=query.status;
  const [items,total]=await Promise.all([MedicalCouncil.find(filter).populate(patientPopulate).populate({path:'doctorIds',populate:{path:'userId',select:'fullName'}}).populate('departmentIds','name').sort({createdAt:-1}).skip(skip).limit(lim),MedicalCouncil.countDocuments(filter)]);
  return {items,total,page:pg,limit:lim};
};
export const createCouncil = async (data,userId,req) => {
  if (!data.patientId || !data.title?.trim() || !data.clinicalReason?.trim()) throw new ApiError(400,'Patient, title and clinical reason are required');
  if (!await Patient.exists({_id:data.patientId})) throw new ApiError(404,'Patient not found');
  if (data.doctorIds?.length && await Doctor.countDocuments({_id:{$in:data.doctorIds}}) !== new Set(data.doctorIds.map(String)).size) throw new ApiError(400,'One or more doctors are invalid');
  const doc=await MedicalCouncil.create({...data,initiatedBy:userId});
  const doctors=await Doctor.find({_id:{$in:doc.doctorIds}}).select('userId');
  await Promise.all(doctors.map(d=>createNotification({userId:d.userId,title:'Yeni konsilium',message:doc.title,type:'general',link:'/bas-hekim/konsiliumlar'})));
  logAction({userId,action:'MEDICAL_COUNCIL_CREATE',resourceType:'MedicalCouncil',resourceId:doc._id,description:doc.title,req});return doc;
};
export const updateCouncil = async (id,data,userId,req) => {
  const doc=await MedicalCouncil.findById(id);if(!doc)throw new ApiError(404,'Council not found');
  ['status','scheduledAt','doctorIds','departmentIds'].forEach(k=>{if(data[k]!==undefined)doc[k]=data[k]});
  if(data.note?.trim()){doc.discussionNotes.push({text:data.note.trim(),authorId:userId});if(doc.discussionNotes.length>100)doc.discussionNotes=doc.discussionNotes.slice(-100);}
  if(data.finalDecision?.trim()){doc.finalDecision=data.finalDecision.trim();doc.finalDecisionApprovedBy=userId;doc.finalDecisionApprovedAt=new Date();doc.status='completed';doc.completedAt=new Date();}
  await doc.save();logAction({userId,action:data.finalDecision?'MEDICAL_COUNCIL_DECISION':'MEDICAL_COUNCIL_UPDATE',resourceType:'MedicalCouncil',resourceId:doc._id,description:'Medical council updated',req,metadata:{status:doc.status}});return doc;
};

export const reports = async query => {
  const match=dateFilter(query,'date'); if(query.status)match.status=query.status;if(query.priority)match.priority=query.priority;
  const [byStatus,byDoctor,labTurnaround,councilStatus,documentApprovals]=await Promise.all([
    Appointment.aggregate([{$match:match},{$group:{_id:'$status',count:{$sum:1}}}]),
    Appointment.aggregate([{$match:match},{$group:{_id:'$doctorId',count:{$sum:1},completed:{$sum:{$cond:[{$eq:['$status','completed']},1,0]}}}},{$sort:{count:-1}},{$limit:20}]),
    LabResult.aggregate([{$match:{completedAt:{$ne:null}}},{$project:{hours:{$divide:[{$subtract:[{$ifNull:['$approvedAt',new Date()]},'$completedAt']},3600000]}}},{$group:{_id:null,averageHours:{$avg:'$hours'}}}]),
    MedicalCouncil.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
    Promise.all([EHR.countDocuments({approvalStatus:'approved'}),DischargeSummary.countDocuments({approvalStatus:'approved'}),MedicalCertificate.countDocuments({approvalStatus:'approved'})]),
  ]);
  return {appointmentsByStatus:byStatus,appointmentsByDoctor:byDoctor,averageLabApprovalHours:labTurnaround[0]?.averageHours||0,councilsByStatus:councilStatus,approvedDocuments:documentApprovals.reduce((a,b)=>a+b,0)};
};

export const audit = async query => {
  const {pg,lim,skip}=pageArgs(query);const filter={...dateFilter(query)};
  if(query.action)filter.action=query.action;
  const allowed=['LabResult','Appointment','EHR','DischargeSummary','MedicalCertificate','MedicalCouncil','ClinicalIncident'];
  filter.resourceType=query.resourceType&&allowed.includes(query.resourceType)?query.resourceType:{$in:allowed};
  const [items,total]=await Promise.all([AuditLog.find(filter).populate('userId','fullName email role').sort({createdAt:-1}).skip(skip).limit(lim),AuditLog.countDocuments(filter)]);
  return {items,total,page:pg,limit:lim};
};
