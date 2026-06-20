import AdminLayout from '../../components/admin/AdminLayout'
import ClinicalReportsContent from '../reports/ClinicalReportsContent'

export default function AdminClinicalReports() {
  return (
    <AdminLayout activePage="clinical-reports">
      <ClinicalReportsContent />
    </AdminLayout>
  )
}
