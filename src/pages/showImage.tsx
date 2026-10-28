import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'

type Imagem = {
  id: number
  titulo: string
  url_image?: string
}

export default function Galeria() {
  const [imagens, setImagens] = useState<Imagem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const fetchImagens = async () => {
      const { data, error } = await supabase.from('galeria').select('*')

      console.log('Dados recebidos:', JSON.stringify(data, null, 2))
      console.log('Erro:', error)

      if (error) {
        setErro(error.message)
      } else if (data) {
        setImagens(data as Imagem[])
      }
      setLoading(false)
    }
    fetchImagens()
  }, [])

  if (loading) return <p>A carregar...</p>
  if (erro) return <p>Erro: {erro}</p>
  if (imagens.length === 0) return <p>Nenhuma imagem encontrada.</p>

  return (
    <div className='bg-slate-600 flex flex-row justify-center content-center gap-2'>
      {imagens.map((img) => {
        // Verificação segura: aceita url_imagem ou url
        const url = img.url_image ?? (img as any).url ?? ''

        return (
          <div key={img.id} style={{ textAlign: 'center' }}>
            <h3>{img.titulo}</h3>

            {url ? (
              <img
                src={url.trim()}
                alt={img.titulo}
                width={200}
                onError={(e) => {
                  console.error('Falha ao carregar:', url)
                  ;(e.currentTarget as HTMLImageElement).src =
                    'https://via.placeholder.com/200x200?text=Erro'
                }}
              />
            ) : (
              <p style={{ color: 'red' }}>URL indisponível</p>
            )}
          </div>
        )
      })}
    </div>
  )
}