export function nativeNotifications() {
  const capacitor = window.Capacitor;
  return capacitor?.isNativePlatform() && capacitor.registerPlugin("LocalNotifications");
}

export async function updateReminder(plugin, id, enabled, time) {
  await plugin.cancel({ notifications: [{ id }] });
  if (!enabled) return;
  const [hour, minute] = time.split(":").map(Number);
  const body = id === 8101 ? "Günün niyetine bir göz at." : "Gününü değerlendirmek için kendine bir dakika ayır.";
  await plugin.schedule({ notifications: [{ id, title: "Veira", body, schedule: { on: { hour, minute }, repeats: true } }] });
}

export async function testReminder(plugin) {
  await plugin.schedule({ notifications: [{ id: 8103, title: "Veira", body: "Bildirimler çalışıyor.", schedule: { at: new Date(Date.now() + 3000) } }] });
}
