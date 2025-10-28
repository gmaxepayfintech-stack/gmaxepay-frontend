/**
 * Get user's location (latitude, longitude) and IP address
 * @returns {Promise<Object>} Object containing location and IP data
 */
export const getLocationAndIP = async () => {
  try {
    // Get IP address
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ipAddress = ipData.ip;
    console.log('IP Address:', ipAddress);

    // Get location
    let locationData = {
      latitude: null,
      longitude: null,
    };

    // Check if geolocation is supported
    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            console.log('Location granted:', locationData);
            resolve({
              ipAddress,
              location: locationData,
            });
          },
          (error) => {
            console.error('Location error:', error.message, error.code);
            console.warn('Location access denied or failed');
            // Return null values for location to indicate failure
            resolve({
              ipAddress,
              location: {
                latitude: null,
                longitude: null,
              },
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      });
    } else {
      console.warn('Geolocation is not supported by this browser');
      return {
        ipAddress,
        location: locationData,
      };
    }
  } catch (error) {
    console.error('Error getting location and IP:', error);
    return {
      ipAddress: null,
      location: {
        latitude: null,
        longitude: null,
      },
    };
  }
};

