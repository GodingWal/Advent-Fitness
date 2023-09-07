import React, { useState } from 'react';
import { Stream } from 'stream-sdk-react-native';

const App = () => {
  const [activities, setActivities] = useState([]);

  const getActivities = async () => {
    const client = new Stream({
      apiKey: 'YOUR_API_KEY',
      apiSecret: 'YOUR_API_SECRET',
    });

    const activities = await client.getActivities();

    setActivities(activities);
  };

  useEffect(() => {
    getActivities();
  }, []);

  return (
    <View>
      {activities.map((activity) => (
        <Text>{activity.text}</Text>
      ))}
    </View>
  );
};