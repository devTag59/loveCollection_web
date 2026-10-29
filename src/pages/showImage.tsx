import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../supabaseClient'

// Estrutura de cada registo da tabela "galeria"
type Imagem = {
  id: number
  titulo: string
  url_image?: string
}

// Imagem de substituição embutida (SVG em base64-free data URI).
// Não depende de servidores externos, por isso nunca falha.
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0" stop-color="#fda4af"/>
           <stop offset="1" stop-color="#c4b5fd"/>
         </linearGradient>
       </defs>
       <rect width="100%" height="100%" fill="url(#g)"/>
       <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="22" font-family="sans-serif">Sem foto</text>
     </svg>`
  )

// Ícone de coração (preenchido quando "ativo" for true)
function IconeCoracao({ ativo }: { ativo: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill={ativo ? 'currentColor' : 'none'} // preenche só quando o utilizador gostou
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

// Ícone de "X" para o botão de passar
function IconeX() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

// Moldura comum a todos os ecrãs (fundo em gradiente + cabeçalho).
// Está definida FORA de Galeria de propósito: se fosse criada dentro,
// o React trataria-a como um componente novo a cada render e
// recarregaria todas as fotos sempre que o utilizador clicasse num botão.
function Moldura({
  children,
  totalGostos,
}: {
  children: ReactNode
  totalGostos: number
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-violet-100">
      {/* Cabeçalho fixo no topo, com efeito de vidro */}
      <header className="sticky top-0 z-10 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 text-rose-500">
            <IconeCoracao ativo />
            <span className="bg-gradient-to-r from-rose-500 to-violet-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Conexão
            </span>
          </div>
          {/* Contador de gostos */}
          <div className="rounded-full bg-rose-500/10 px-4 py-1.5 text-sm font-semibold text-rose-600">
            ♥ {totalGostos} {totalGostos === 1 ? 'gosto' : 'gostos'}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}

export default function Galeria() {
  // Lista de perfis vindos do Supabase
  const [imagens, setImagens] = useState<Imagem[]>([])
  // Controla o ecrã de carregamento
  const [loading, setLoading] = useState(true)
  // Mensagem de erro (null quando está tudo bem)
  const [erro, setErro] = useState<string | null>(null)
  // IDs dos perfis a que o utilizador deu "gosto"
  const [gostos, setGostos] = useState<Set<number>>(new Set())
  // IDs dos perfis que o utilizador "passou" (ficam escondidos)
  const [passados, setPassados] = useState<Set<number>>(new Set())

  // Vai buscar os dados uma única vez, quando o componente aparece
  useEffect(() => {
    const fetchImagens = async () => {
      const { data, error } = await supabase.from('galeria').select('*')

      if (error) {
        setErro(error.message)
      } else if (data) {
        const titulos=data.map((img) => img.titulo)
        console.log('Titulos das imagens:', titulos)
        setImagens(data as Imagem[])
      }
      setLoading(false)
    }
    fetchImagens()
  }, [])

  // Alterna o "gosto": se já existe remove, se não existe adiciona.
  // Criamos sempre um Set novo para o React detetar a mudança.
  const alternarGosto = (id: number) => {
    setGostos((anterior) => {
      const novo = new Set(anterior)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  // Marca o perfil como "passado" para deixar de aparecer
  const passar = (id: number) => {
    setPassados((anterior) => new Set(anterior).add(id))
  }

  // Só mostramos os perfis que ainda não foram passados
  const visiveis = imagens.filter((img) => !passados.has(img.id))

  // ---------- Estado: a carregar (cartões "esqueleto" a pulsar) ----------
  if (loading) {
    return (
      <Moldura totalGostos={gostos.size}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-3xl bg-white/70 shadow-lg"
            />
          ))}
        </div>
      </Moldura>
    )
  }

  // ---------- Estado: erro ----------
  if (erro) {
    return (
      <Moldura totalGostos={gostos.size}>
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-4xl">💔</p>
          <h2 className="mt-3 text-xl font-bold text-slate-800">
            Ups, algo correu mal
          </h2>
          <p className="mt-2 text-sm text-slate-500">{erro}</p>
        </div>
      </Moldura>
    )
  }

  // ---------- Estado: sem perfis (nunca houve ou já passou todos) ----------
  if (visiveis.length === 0) {
    return (
      <Moldura totalGostos={gostos.size}>
        <div className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <p className="text-4xl">✨</p>
          <h2 className="mt-3 text-xl font-bold text-slate-800">
            {imagens.length === 0
              ? 'Ainda não há perfis'
              : 'Já viu todos os perfis'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Volte mais tarde para conhecer pessoas novas.
          </p>
          {/* Só faz sentido recomeçar se existirem perfis passados */}
          {passados.size > 0 && (
            <button
              onClick={() => setPassados(new Set())}
              className="mt-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Ver outra vez
            </button>
          )}
        </div>
      </Moldura>
    )
  }

  // ---------- Estado normal: grelha de cartões ----------
  return (
    <Moldura totalGostos={gostos.size}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Pessoas perto de si
      </h1>

      {/* Grelha responsiva: 1 coluna no telemóvel até 4 em ecrãs grandes */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visiveis.map((img) => {
          // Aceita url_image ou url, conforme o nome da coluna na tabela
          const url = img.url_image ?? (img as any).url ?? ''
          const gostou = gostos.has(img.id)

          return (
            <article
              key={img.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-white shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Foto a ocupar o cartão inteiro; amplia ao passar o rato */}
              <img
                src={url ? url.trim() : PLACEHOLDER}
                alt={img.titulo}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement
                  el.onerror = null // evita ciclo infinito de erros
                  el.src = PLACEHOLDER
                }}
              />

              {/* Degradê escuro em baixo para o texto ficar legível */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Etiqueta "online" no canto superior */}
              <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online
              </span>

              {/* Nome + botões de ação, ancorados ao fundo */}
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-2xl font-bold text-white drop-shadow">
                  {img.titulo}
                </h3>

                <div className="mt-4 flex items-center justify-center gap-5">
                  {/* Botão passar */}
                  <button
                    onClick={() => passar(img.id)}
                    aria-label={`Passar ${img.titulo}`}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:scale-110 hover:text-slate-800 active:scale-95"
                  >
                    <IconeX />
                  </button>

                  {/* Botão gostar: muda de cor quando ativo */}
                  <button
                    onClick={() => alternarGosto(img.id)}
                    aria-label={`Gostar de ${img.titulo}`}
                    aria-pressed={gostou}
                    className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition hover:scale-110 active:scale-95 ${
                      gostou
                        ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white'
                        : 'bg-white text-rose-500'
                    }`}
                  >
                    <IconeCoracao ativo={gostou} />
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </Moldura>
  )
}