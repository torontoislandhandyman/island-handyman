import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = trpc.notifications.list.useQuery(undefined, { retry: false });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => notifications.refetch() });
  const unread = notifications.data?.filter((item) => !item.readAt) ?? [];
  return <div className="ih-notification-wrap"><button className="ih-notification-button" aria-label="Open notifications" onClick={() => setOpen((value) => !value)}><Bell size={16} />{unread.length ? <span>{unread.length}</span> : null}</button>{open && <div className="ih-notification-popover"><div className="ih-notification-popover-head"><strong>Notifications</strong>{unread.length ? <button onClick={() => unread.forEach((item) => markRead.mutate({ id: item.id }))}><Check size={13} /> Mark read</button> : null}</div>{notifications.isLoading ? <p>Loading…</p> : notifications.data?.length ? notifications.data.slice(0, 8).map((item) => <button className={`ih-notification-item ${item.readAt ? "read" : ""}`} key={item.id} onClick={() => !item.readAt && markRead.mutate({ id: item.id })}><span><strong>{item.title}</strong><small>{item.body}</small><time>{new Date(item.createdAt).toLocaleString()}</time></span></button>) : <p>No notifications yet.</p>}</div>}</div>;
}
