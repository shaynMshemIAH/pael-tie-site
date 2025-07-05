import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export async function getStaticProps() {
  const folder = 'content/logs/A0';
  const files = fs.readdirSync(folder);

  const logs = files.map((filename) => {
    const filePath = path.join(folder, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);

    return {
      slug: filename.replace('.md', ''),
      title: data.title,
      date: String(data.date),
      status: data.tags?.includes('preliminary') ? '🟡 Preliminary' : '✅ Final',
    };
  });

  return { props: { logs } };
}

export default function LogsPage({ logs }: any) {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>📜 Anomaly Logs</h1>
      <ul>
        {logs.map((log: any) => (
          <li key={log.slug} style={{ marginBottom: '1rem' }}>
            <Link href={`/logs/A0/${log.slug}`}>
              <strong>{log.title}</strong>
            </Link><br />
            <small>{log.date} — {log.status}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
