export const premiumPlans = [
  { id: 'life.veira.premium.monthly', label: 'Aylık', price: '₺59,99', period: 'ay', basePlan: 'monthly' },
  { id: 'life.veira.premium.yearly', label: 'Yıllık', price: '₺499,99', period: 'yıl', basePlan: 'yearly' }
];
let active = false;
export const hasPremium = () => active;
export const isFreeTemplate = template => ['collage-0', 'collage-1', 'collage-2'].includes(template?.id);
export function requestPremium() { window.dispatchEvent(new Event('veira:premium-open')); }
function billing() {
  const cap = window.Capacitor;
  if (!cap?.isNativePlatform?.()) throw new Error('Satın alma iPhone veya Android uygulamasında kullanılabilir.');
  return cap.registerPlugin('NativePurchases');
}
export async function refreshPremium() {
  try {
    const { purchases } = await billing().getPurchases({ productType: 'subs' });
    const platform = window.Capacitor.getPlatform();
    active = purchases.some(p => premiumPlans.some(plan => plan.id === p.productIdentifier) &&
      (platform === 'ios' ? p.isActive === true && Date.parse(p.expirationDate) > Date.now() :
        ['1', 'PURCHASED'].includes(String(p.purchaseState)) && p.isAcknowledged === true));
  } catch { active = false; }
  window.dispatchEvent(new Event('veira:premium-change'));
  return active;
}
export async function loadPremiumProducts() {
  return (await billing().getProducts({ productIdentifiers: premiumPlans.map(p => p.id), productType: 'subs' })).products;
}
export async function purchasePremium(plan, product) {
  if (!product) throw new Error('Bu plan henüz mağazada satışa açık değil.');
  await billing().purchaseProduct({ productIdentifier: plan.id, productType: 'subs', planIdentifier: plan.basePlan, ...(product.offerToken ? { offerToken: product.offerToken } : {}) });
  return refreshPremium();
}
export async function restorePremium() { await billing().restorePurchases(); return refreshPremium(); }
if (typeof window !== 'undefined') {
  refreshPremium();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshPremium(); });
}
