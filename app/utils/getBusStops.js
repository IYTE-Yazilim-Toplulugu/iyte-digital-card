import Papa from 'papaparse';

export const getBusStops = async (hatNo) => {
  const response = await fetch('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-duraklari.csv');
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      complete: (result) => {
        console.log('Parsed data sample:', result.data.slice(0, 5)); // İlk 5 veriyi göster

        const filteredStops = result.data.filter(stop => {
          if (!stop.DURAKTAN_GECEN_HATLAR) {
            console.log('Stop without DURAKTAN_GECEN_HATLAR:', stop);
            return false;
          }
          return stop.DURAKTAN_GECEN_HATLAR.split('-').includes(hatNo);
        });

        console.log(`Filtered stops for hat ${hatNo}:`, filteredStops.length);

        resolve(filteredStops);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      },
    });
  });
};