import { SignUp } from '@clerk/clerk-react';
import { useSignUp } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalAPI from '../../../../service/GlobalAPI'; // asigură-te că e corect

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const navigate = useNavigate();

  useEffect(() => {
    const createStrapiUser = async () => {
      const session = await signUp?.getSession();
      const user = await signUp?.getUser();
      if (user) {
        const payload = {
          username: user.username || user.id,
          email: user.primaryEmailAddress?.emailAddress,
          clerkUserId: user.id,
          confirmed: true,
          blocked: false,
        };
        await GlobalAPI.CreateStrapiUser(payload);
        navigate('/dashboard');
      }
    };

    createStrapiUser();
  }, [signUp]);

  return (
    <div className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/fundalHome.png')" }}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="z-10">
        <SignUp
          path="/auth/sign-up"
          routing="path"
          signInUrl="/auth/sign-in"
        />
      </div>
    </div>
  );
}
