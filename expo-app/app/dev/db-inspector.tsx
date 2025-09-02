// app/dev/db-inspector.tsx
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type TableInfo = { name: string; rows: number };

export default function DbInspector() {
  const db = useSQLiteContext();
  const [tables, setTables] = useState<TableInfo[]>([]);

  useEffect(() => {
    (async () => {
      const names = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
      );
      const results: TableInfo[] = [];
      for (const n of names) {
        const r = await db.getFirstAsync<{ c: number }>(
          `SELECT COUNT(*) c FROM ${n.name}`
        );
        results.push({ name: n.name, rows: r?.c ?? 0 });
      }
      setTables(results);
    })();
  }, [db]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        DB Tables
      </Text>
      {tables.map((t) => (
        <View
          key={t.name}
          style={{
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: "#333",
          }}
        >
          <Text style={{ fontWeight: "600" }}>{t.name}</Text>
          <Text>{t.rows} rows</Text>
        </View>
      ))}
    </ScrollView>
  );
}
