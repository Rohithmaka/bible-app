import { Share, Platform } from 'react-native';

export async function shareScriptureVerse(reference: string, verseText: string, translation: string = 'KJV') {
  const shareMessage = `"${verseText}"\n\n— ${reference} (${translation})\n\nShared via Sela App`;
  try {
    const result = await Share.share(
      {
        message: shareMessage,
        title: `Scripture: ${reference}`,
      },
      {
        dialogTitle: `Share ${reference}`, // Android
        subject: `Scripture: ${reference}`,  // iOS email/messaging
      }
    );
    return result;
  } catch (error) {
    console.error('Error sharing scripture:', error);
    return null;
  }
}
