export default function dedent(
  strings: TemplateStringsArray,
  ...values: any[]
): string {
  let result = strings.reduce(
    (acc, str, i) => acc + str + (values[i] ?? ''),
    ''
  );
  const lines = result.split('\n');
  if (lines[0].trim() === '') lines.shift();
  if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length)
  );
  return lines.map((l) => l.slice(indent)).join('\n');
}
