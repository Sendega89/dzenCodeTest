export default function ProductsMicrofrontendPage() {
  const shell = process.env.NEXT_PUBLIC_SHELL_URL || 'http://localhost:3000'
  return (
    <main className="content">
      <section className="plain-card stack">
        <h1>Products microfrontend</h1>
        <p>
          Этот фронт собирается и запускается отдельно от оболочки. В составе основного приложения страница продуктов
          открывается по адресу <a href={`${shell}/products`}>{shell}/products</a>.
        </p>
        <p className="hint">basePath: /mfe. Отдельный порт: 3001.</p>
      </section>
    </main>
  )
}
