import { friends } from './mockFriends';

export const conversations = [
  {
    id: 'c1',
    participant: friends[1],
    lastMessage: 'Hey Cody, you should definitely check out Yoga Six for hot yoga! They have...',
    timestamp: '11:23 AM',
    unread: true,
  },
  {
    id: 'c2',
    participant: friends[2],
    lastMessage: 'Yeah sounds good man.',
    timestamp: 'Aug 21',
    unread: false,
  },
  {
    id: 'c3',
    participant: friends[4],
    lastMessage: 'Hmm... good question. I’m not sure',
    timestamp: 'Aug 19',
    unread: false,
  },
  {
    id: 'c4',
    participant: friends[5],
    lastMessage: 'What type of surfboard did you end up...',
    timestamp: 'Jul 19',
    unread: false,
  },
  {
    id: 'c5',
    participant: friends[0],
    lastMessage: 'You down to hit up TCP?',
    timestamp: 'Jul 19',
    unread: false,
  },
];

export const sampleThread = [
  { id: 'm1', fromMe: false, text: 'Hey, what time are we going surfing?', time: '10:32 AM' },
  { id: 'm2', fromMe: true, text: 'Hmm..maybe do a sunset session?', time: '10:42 AM' },
  {
    id: 'm3',
    fromMe: true,
    text: 'Or if you want, we can paddle out in the morning to start the day off with some exercise!',
    time: '10:45 AM',
  },
  { id: 'm4', fromMe: false, text: 'So down!', time: '10:53 AM' },
  { id: 'm5', fromMe: false, text: 'Let’s go to Sunset Cliffs this time tho.', time: '11:12 AM' },
];
