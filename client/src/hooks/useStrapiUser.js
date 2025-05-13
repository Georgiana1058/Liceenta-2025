// src/hooks/useStrapiUser.jsx
import { useState, useEffect } from 'react';
import GlobalAPI from '../../service/GlobalAPI';

export function useStrapiUser(clerkUserId) {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // dacă încă n-ai clerkUserId, opreşte aici
    if (!clerkUserId) {
      setState({ user: null, loading: false, error: null });
      return;
    }

    setState(s => ({ ...s, loading: true }));
    // fetch către Strapi: taie după clerkUserId + populaţe rolul
    GlobalAPI.GetUsersByClerkId(clerkUserId) // vezi mai jos implementare
      .then(res => {
        const found = res.data?.[0] ?? null;
        setState({ user: found, loading: false, error: null });
      })
      .catch(err => {
        console.error(err);
        setState({ user: null, loading: false, error: err });
      });
  }, [clerkUserId]);

  return state;
}
