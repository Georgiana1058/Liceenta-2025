import React, { useState, useContext, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import { Brain, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import model from '../../../../../service/AIModal'
import {
  Editor,
  EditorProvider,
  Toolbar,
  BtnItalic,
  BtnBold,
  BtnUnderline,
  BtnStrikeThrough,
  BtnNumberedList,
  BtnBulletList,
  BtnLink,
  Separator,
} from 'react-simple-wysiwyg'

const PROMPT_JSON = `
For the position titled "{positionTitle}", write 4–5 resume bullet points as plain text.
• Each bullet must start with a strong action verb.
• Include the technologies you used (languages, frameworks, tools).
• Include at least one quantifiable result per bullet.
• Do NOT return HTML, JSON, or markdown—only raw text, one bullet per line.
`

export default function RichTextEditor({
  index,
  defaultValue,
  positionTitle,
  onRichTextEditorChange
}) {
  const { resumeInfo } = useContext(ResumeInfoContext)

  const [value, setValue] = useState(defaultValue ?? '')
  const [loading, setLoading] = useState(false)
  // flag care ne spune că am tratat fie importul din DB, fie generarea AI
  const [handled, setHandled] = useState(false)

  // 1) Dacă există defaultValue (din DB), îl preluăm o singură dată
  useEffect(() => {
    if (defaultValue && !handled) {
      setValue(defaultValue)
      setHandled(true)
    }
  }, [defaultValue, handled])

  const generate = async () => {
    setLoading(true)
    try {
      const prompt = PROMPT_JSON.replace('{positionTitle}', positionTitle)
      const res = await model.generateContent(prompt)
      const raw = await (await res.response).text()
      const text = raw.replace(/```/g, '').trim()

      setValue(text)
      onRichTextEditorChange({ target: { value: text } })
    } catch {
      toast.error('AI generation failed')
    } finally {
      setLoading(false)
    }
  }

  // 2) Dacă nu avem încă nici defaultValue și nici nu am generat, 
  //    dar există positionTitle, generăm o singură dată
  useEffect(() => {
    if (!handled && positionTitle) {
      setHandled(true)
      generate()
    }
  }, [positionTitle, handled])

  // 3) handlerul butonului de manual trigger
  const onClickAI = () => {
    if (!positionTitle) {
      return toast.error('Please add a Position Title first')
    }
    // dacă apesi manual, ignorăm flag‑ul handled ca să putem regenera
    setHandled(false)
    generate()
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs">Summary</label>
        <Button
          variant="outline"
          size="sm"
          onClick={onClickAI}
          disabled={!positionTitle || loading}
          className="flex gap-2 text-primary border-primary disabled:opacity-50"
        >
          {loading
            ? <LoaderCircle className="animate-spin" />
            : <>
                <Brain className="w-4 h-4" />
                Generate from AI
              </>
          }
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={e => {
            setValue(e.target.value)
            onRichTextEditorChange(e)
          }}
        >
          <Toolbar>
            <BtnItalic />
            <BtnBold />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  )
}
