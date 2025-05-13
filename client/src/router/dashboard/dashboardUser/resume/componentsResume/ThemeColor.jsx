import React, { useContext, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from '@/components/ui/button'
import { LayoutGrid } from 'lucide-react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

function ThemeColor() {
    const colors = [
        "#2C3E50", // Bleumarin închis
        "#2980B9", // Albastru petrol
        "#4A4A4A", // Gri cărbune
        "#27AE60", // Verde închis
        "#8E44AD", // Bordo elegant
        "#E67E22", // Portocaliu călduț
        "#E74C3C", // Roșu moderat pentru accente
        "#16A085", // Verde-mentă calm
        "#D35400", // Portocaliu compatibil
        "#34495E", // Albastru-gri neutru
        "#7F8C8D", // Gri median
        "#1ABC9C", // Turcoaz deschis
        "#9B59B6", // Mov pastel
        "#BDC3C7", // Gri deschis
        "#C0392B",  // Roșu închis pentru evidențiere
        "#F5F5DC", // Beige clasic
        "#FFF8E7", // Crem deschis
        "#FFE5B4", // Piersică delicată
        "#FFDAB9", // Peach puff
        "#FFE4C4", // Bisque
        "#FFEFD5", // Papaya whip
        "#FFFACD", // Lemon chiffon
        "#FAF0E6", // Linen
        "#FFF0F5", // Lavender blush
        "#FFE4E1", // Misty rose
        "#FFEBCD", // Blanched almond
        "#FADBD8", // Pink whisper
        "#FDEBD0", // Light peach
        "#F9E79F", // Pastel yellow
        "#F6DDCC", // Sandstone
        "#ECD9B0", // Warm sand
        "#D5B895", // Coffee cream
        "#E8C1A0", // Caramel mist
        "#E3D5B7"  // Soft khaki
    ]


    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext)
    const [selectedColor, setSelectedColor] = useState(null)
    const { resumeId } = useParams()

    const onColorSelect = (color) => {
        // 1) Actualizezi contextul local
        setResumeInfo({ ...resumeInfo, themeColor: color })

        // 2) Aprinzi rapid inelul de feedback
        setSelectedColor(color)

        // 3) Apelezi API-ul și prinzi eventuale erori
        const payload = { data: { themeColor: color } }
        GlobalAPI.UpdateResumeDetail(resumeId, payload)
            .then(resp => {
                console.log("✅ Theme updated:", resp)
                toast.success('Theme Color Updated!')
            })
            .catch(err => {
                console.error("❌ Theme update failed:", err)
                toast.error('Failed to update theme color')
            })

        // 4) Sting inelul după 500ms
        setTimeout(() => setSelectedColor(null), 500)
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex gap-2">
                    <LayoutGrid className="w-4 h-4" /> Theme
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4">
                <h2 className="mb-2 font-bold">Select Theme color</h2>
                <div className="grid grid-cols-5 gap-3">
                    {colors.map(color => {
                        const isClicked = selectedColor === color
                        return (
                            <div
                                key={color}
                                onClick={() => onColorSelect(color)}
                                className={`
                  h-5 w-5 rounded-full cursor-pointer
                  ring-2
                  ${isClicked
                                        ? 'ring-black ring-offset-6 ring-offset-white'
                                        : 'ring-transparent'}
                `}
                                style={{ background: color }}
                            />
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ThemeColor
