import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { UI } from '@/theme';

const DAY_SECONDS = 24 * 3600;
const START_SECONDS = 23 * 3600 + 59 * 60 + 50;

const pad = (n: number) => n.toString().padStart(2, '0');

/** HH : MM : SS ticker in orange digit boxes ("Next drop in …"). Loops at zero. */
export function Countdown() {
  const [secs, setSecs] = useState(START_SECONDS);
  const ref = useRef(secs);

  useEffect(() => {
    const id = setInterval(() => {
      ref.current = ref.current > 0 ? ref.current - 1 : DAY_SECONDS;
      setSecs(ref.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const parts = [
    pad(Math.floor(secs / 3600)),
    pad(Math.floor((secs % 3600) / 60)),
    pad(secs % 60),
  ];

  return (
    <View style={styles.timer}>
      {parts.map((v, i) => (
        <View key={i} style={styles.timerRow}>
          {i > 0 && <Text style={styles.timerColon}>:</Text>}
          <View style={styles.timerBox}>
            <Text style={styles.timerTxt}>{v}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timer: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' },
  timerRow: { flexDirection: 'row', alignItems: 'center' },
  timerColon: { color: UI.accent, fontSize: 20, fontWeight: '900', marginHorizontal: 3 },
  timerBox: {
    backgroundColor: UI.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 34,
    alignItems: 'center',
  },
  timerTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
