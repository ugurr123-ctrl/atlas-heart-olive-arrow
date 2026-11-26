export async function exportBoardPng(canvas) {
  const name = `veira-pano-${Date.now()}.png`;
  const capacitor = window.Capacitor;
  if (capacitor?.isNativePlatform?.()) {
    const filesystem = capacitor.registerPlugin('Filesystem');
    const share = capacitor.registerPlugin('Share');
    const data = canvas.toDataURL('image/png').split(',')[1];
    const { uri } = await filesystem.writeFile({ path: `exports/${name}`, data, directory: 'CACHE', recursive: true });
    try {
      await share.share({ title: 'Hayal panom', files: [uri], dialogTitle: 'Panoyu kaydet veya paylaş' });
      return 'native';
    } catch (error) {
      if (/cancel|dismiss/i.test(error?.message || '')) return 'cancelled';
      throw error;
    }
  }
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG oluşturulamadı')), 'image/png'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = name;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return 'download';
}
