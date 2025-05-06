import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useContext, useState, useEffect } from 'react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { useParams } from 'react-router-dom'
import GlobalAPI from '../../../../../../service/GlobalAPI'
import { Brain, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import model from '../../../../../../service/AIModal'



function Summery({ enableNext }) {
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);
    const [summery, setSummery] = useState();
    const [loading, setLoading] = useState(false);
    const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState([]);
    const params = useParams();
    useEffect(() => {
        summery && setResumeInfo({
            ...resumeInfo,
            summery: summery
        })
    }, [summery])

    const GenerateSummeryFromAI = async () => {
        setLoading(true);
        const prompt = `
    Give 3 different professional 4-5 sentence summaries for a student based on this input: "${summery}".
    Each version should sound confident, polished, and resume-appropriate.
    Return them as a bullet list or JSON array.
    `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = await response.text();
      
        // 1. Eliminăm eventualul ```json sau ``` și whitespace
        text = text.replace(/```json|```|\n/g, '');
      
        // 2. Parsăm JSON-ul
        const suggestions = JSON.parse(text);
      
        // 3. Extragem textele propriu-zise (doar valoarea "summary")
        const cleanedSuggestions = suggestions.map(item => item.summary);
      
        setAiGenerateSummeryList(cleanedSuggestions);
        toast.success("AI suggestions ready!");
      } catch (err) {
        toast.error("Failed to generate suggestions.");
        console.error(err);
      }
        setLoading(false);
    };


    const onSave = (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            data: {
                summery: summery
            }
        };
        GlobalAPI.UpdateResumeDetail(params?.resumeId, data).then(resp => {
            console.log(resp);
            enableNext(true);
            setLoading(false);
            toast("Details updated");
            setAiGenerateSummeryList([]); // se goleste lista genarata de AI
        }, (error) => {
            setLoading(false);
        });
    };
    
   
    return (
        <div>
            <div className='p-5 shadow-lg rounded-lg border-t-blue-900 border-t-4 mt-10'>

                <h2 className='font-bold text-lg'>Summery</h2>

                <p>Add description about your hobby</p>

                <form className='mt-7' onSubmit={onSave}>

                    <div className='flex justify-between items-end'>
                        <label>Add Summery</label>
                        <Button variant="outline" type="button" size="sm"
                            onClick={GenerateSummeryFromAI}
                            className="border-blue-900 text-primary flex gap-2">
                            <Brain className='h-4 w-4' /> Generate from AI</Button>
                    </div>

                    <Textarea className="mt-5" required
                        value={summery}
                        onChange={(e) => setSummery(e.target.value)}
                    />

                    <div className="mt-2 flex justify-end">
                        <Button type="submit"
                            disabled={loading}>
                            {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                        </Button>
                    </div>

                    {/*AICI AI LISTA DE SUGESTII GENERATE */}
                    {aiGeneratedSummeryList.length > 0 && (
                        <div className="mt-4">
                            <h2 className="font-bold text-md">Suggestions:</h2>
                            <ul className="space-y-2 mt-2">
                                {aiGeneratedSummeryList.map((item, index) => (
                                    <li
                                        key={index}
                                        className="cursor-pointer hover:bg-gray-100 p-2 border rounded"
                                        onClick={() => {
                                            setSummery(item); // actualizează Textarea
                                            setResumeInfo(prev => ({ ...prev, summery: item })); // actualizează preview-ul
                                        }}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                </form>

            </div>

        </div>
    )
}

export default Summery