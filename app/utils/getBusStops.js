import Papa from 'papaparse';

// İki nokta arasındaki mesafeyi hesaplayan yardımcı fonksiyon (Haversine formülü)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Dünya'nın yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Metre cinsinden mesafe
}

export const getBusStops = async (hatNo) => {
  const response = await fetch('https://openfiles.izmir.bel.tr/211488/docs/eshot-otobus-duraklari.csv');
  const text = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      complete: (result) => {
        console.log('Parsed data sample:', result.data.slice(0, 5));

        const uniqueStops = new Map();
        const distanceThreshold = 70; // 10 metre eşik değeri

        result.data.forEach(stop => {
          if (!stop.DURAKTAN_GECEN_HATLAR || !stop.ENLEM || !stop.BOYLAM) {
            console.log('Invalid stop data:', stop);
            return;
          }

          if (stop.DURAKTAN_GECEN_HATLAR.split('-').includes(hatNo)) {
            let isNearExistingStop = false;
            for (let [, existingStop] of uniqueStops) {
              const distance = calculateDistance(
                parseFloat(stop.ENLEM), parseFloat(stop.BOYLAM),
                parseFloat(existingStop.ENLEM), parseFloat(existingStop.BOYLAM)
              );
              if (distance < distanceThreshold) {
                isNearExistingStop = true;
                break;
              }
            }

            if (!isNearExistingStop) {
              uniqueStops.set(stop.DURAK_ID, stop);
            }
          }
        });

        const filteredStops = Array.from(uniqueStops.values());

        console.log(`Filtered unique stops for hat ${hatNo}:`, filteredStops.length);

        resolve(filteredStops);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        reject(error);
      },
    });
  });
};