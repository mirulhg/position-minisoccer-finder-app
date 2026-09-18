import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { supabase } from '../../../lib/supabase';
import { useAuthSession } from '../../auth';
import {
  acknowledgePositionChange,
  fetchUnacknowledgedPositionChange,
  type PositionChangeNotification,
} from '../lib/fetch-position-change-notification';

/** FR-16 — banner in-app, dipasang di ResultsScreen dan HistoryScreen (PRD: "saat pengguna membuka kembali"). */
export function PositionChangeBanner() {
  const { session } = useAuthSession();
  const [notification, setNotification] = useState<PositionChangeNotification | null>(null);

  useEffect(() => {
    // Sinkronisasi dengan Supabase: dicek sekali saat komponen ini dibuka.
    if (!supabase || !session) return;
    let isMounted = true;
    const client = supabase;
    fetchUnacknowledgedPositionChange(client, session.user.id).then((result) => {
      if (isMounted) setNotification(result);
    });
    return () => {
      isMounted = false;
    };
  }, [session]);

  if (!notification) return null;

  async function handleDismiss() {
    if (!supabase || !notification) return;
    await acknowledgePositionChange(supabase, notification.profileId);
    setNotification(null);
  }

  return (
    <Card className="border-primary-300 bg-primary-50">
      <p className="text-sm text-primary-800">
        Posisi utamamu berubah jadi <span className="font-semibold">{notification.positionName}</span> setelah
        pertandingan terbaru.
      </p>
      <Button variant="ghost" onClick={handleDismiss} className="mt-2 w-full">
        Mengerti
      </Button>
    </Card>
  );
}
