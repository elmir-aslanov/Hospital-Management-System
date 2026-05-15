import { useState } from 'react';

export function useExternalLink() {
  const [modal, setModal] = useState({ isOpen: false, url: '', siteName: '' });

  const openExternalLink = (url, siteName) => {
    setModal({ isOpen: true, url, siteName });
  };

  const handleConfirm = () => {
    window.open(modal.url, '_blank', 'noopener,noreferrer');
    setModal({ isOpen: false, url: '', siteName: '' });
  };

  const handleCancel = () => {
    setModal({ isOpen: false, url: '', siteName: '' });
  };

  return { modal, openExternalLink, handleConfirm, handleCancel };
}
