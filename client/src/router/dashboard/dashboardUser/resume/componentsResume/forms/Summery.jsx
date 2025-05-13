import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useContext, useState, useEffect } from 'react'
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { useParams } from 'react-router-dom'
import GlobalAPI from "../../../../../../../service/GlobalAPI"
import { Brain, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import model from '../../../../../../../service/AIModal'



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
  You're a resume assistant helping a student write a professional Summary section for their CV.
Given the raw input: "${summery}", generate 3 polished 3-4 sentence summaries.

Each summary should:
1. Start with who they are (e.g. Computer Science student),
2. Mention 2-3 of their personal interests or hobbies (e.g. app development, tech volunteering),
3. Include soft skills (e.g. problem-solving, communication),
4. Finish with a short career goal (e.g. seeking internship opportunities).

Return the output as a JSON array with "summary" keys only.
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

                <h2 className='font-bold text-lg'>Summary (Interests & Objectives)</h2>


                <form className='mt-7' onSubmit={onSave}>

                    <div className='flex justify-between items-end'>
                        <label className="font-medium">
                            
                            <span className="block text-sm text-gray-500 mt-1 leading-snug">
                                A good summary should include:
                                <br />1. <strong>Who you are</strong> — your current status (e.g. Computer Science student at X University)
                                <br />2. <strong>What you're passionate about</strong> — career-related fields or hobbies (e.g. web development, hackathons)
                                <br />3. <strong>What you can do</strong> — key skills (e.g. problem-solving, teamwork)
                                <br />4. <strong>What you are aiming for</strong> — your career goal (e.g. internship, part-time job)
                            </span>
                        </label>


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