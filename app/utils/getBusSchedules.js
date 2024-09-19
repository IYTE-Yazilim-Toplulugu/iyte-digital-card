// utils/getBusSchedules.js
import Papa from 'papaparse';

export const getBusSchedules = async (hatNo) => {
  const response = await fetch('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-hareketsaatleri.csv');
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      complete: (result) => {
        // Filtreleme işlemi
        const filteredData = result.data.filter(item => item.HAT_NO === hatNo);
        resolve(filteredData);
      },
      error: (error) => reject(error),
    });
  });
};
