import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
    // Placeholder config - user must replace with actual
    apiKey: "AIzaSy_PLACEHOLDER_KEY",
    authDomain: "flood-detection-app.firebaseapp.com",
    databaseURL: "https://flood-detection-app-default-rtdb.firebaseio.com",
    projectId: "flood-detection-app",
    storageBucket: "flood-detection-app.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

/**
 * Subscribes to real-time updates for a specific flood sensor.
 * @param {string} sensorId - The ID of the sensor in Firebase
 * @param {function} callback - Function called with new data when updated
 */
export function subscribeToSensor(sensorId, callback) {
    const sensorRef = ref(database, `sensors/${sensorId}`);
    onValue(sensorRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            callback(data);
        }
    });
}
