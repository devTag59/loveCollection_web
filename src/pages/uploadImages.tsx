import { useState } from 'react'
import { supabase } from '../../supabaseClient'

export default function UploadImagem() {
  const [titulo, setTitulo] = useState('')
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  // Gera um nome de ficheiro seguro para o Storage
  const gerarNomeSeguro = (file: File): string => {
  const ultimoPonto = file.name.lastIndexOf('.')
  const extensao = ultimoPonto !== -1 ? file.name.slice(ultimoPonto) : ''
  const nomeBase = ultimoPonto !== -1 ? file.name.slice(0, ultimoPonto) : file.name

  const nomeLimpo = nomeBase
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')  // remove hífenes no início e no fim
    .toLowerCase()

  return `${Date.now()}-${nomeLimpo}${extensao.toLowerCase()}`
}

  const handleUpload = async () => {
    if (!ficheiro || !titulo.trim()) return
    setLoading(true)

    try {
      // 1. Upload para o Storage com nome seguro
      const nomeFicheiro = gerarNomeSeguro(ficheiro)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(nomeFicheiro, ficheiro, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 2. Obter o URL público
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(uploadData.path)

      const urlPublico = urlData.publicUrl

      // 3. Guardar na tabela
      const { error: dbError } = await supabase
        .from('galeria')
        .insert([{ titulo: titulo.trim(), url_image: urlPublico }])

      if (dbError) throw dbError

      alert('Imagem guardada com sucesso!')
      setTitulo('')
      setFicheiro(null)
      // Limpa o input de ficheiro (opcional)
      const inputFile = document.querySelector<HTMLInputElement>('input[type="file"]')
      if (inputFile) inputFile.value = ''
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao guardar a imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Título da imagem"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFicheiro(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'A guardar...' : 'Guardar Imagem'}
      </button>
    </div>
  )
}