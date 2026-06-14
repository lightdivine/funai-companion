import webpush from 'web-push';

// Configure the push service using environment variables
webpush.setVapidDetails(
  'mailto:support@funai.edu.ng', // Institutional contact
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const sendNotification = async (subscription: any, payload: string) => {
  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error) {
    console.error("Push Notification Error:", error);
    return { success: false, error };
  }
};