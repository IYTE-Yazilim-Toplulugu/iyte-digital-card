import Papa from 'papaparse';

export interface Notification {
  line: string;
  title: string;
  startDate: string;
  endDate: string;
}

// Belirli hat numaralarını filtrelemek için kullanacağımız hat numaraları
const filterLines = ['982', '882', '883', '981','104'];

export const fetchNotifications = async (url: string): Promise<Notification[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const csvText = await response.text();
    const notifications: Notification[] = [];
    
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row: any) => {
          if (filterLines.includes(row.HAT_NO)) {
            notifications.push({
              line: row.HAT_NO,
              title: row.BASLIK,
              startDate: row.BASLAMA_TARIHI,
              endDate: row.BITIS_TARIHI,
            });
          }
        });
      },
      error: (error) => {
        throw new Error(`Parsing error: ${error.message}`);
      }
    });
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
};
