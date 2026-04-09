import { useState, useEffect } from 'react';
import { Player, MatchRecord } from './types';
import { supabase } from './lib/supabase';

export function useAppStore() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [playersRes, matchesRes] = await Promise.all([
          supabase.from('sf_players').select('*'),
          supabase.from('sf_matches').select('*')
        ]);

        if (playersRes.data && !playersRes.error) {
          setPlayers(playersRes.data);
        } else if (playersRes.error) {
          console.error("Error fetching players:", playersRes.error);
        }

        if (matchesRes.data && !matchesRes.error) {
          setMatches(matchesRes.data);
        } else if (matchesRes.error) {
          console.error("Error fetching matches:", matchesRes.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addPlayer = async (player: Player) => {
    setPlayers(prev => [...prev, player]);
    await supabase.from('sf_players').insert([player]);
  };

  const updatePlayer = async (updated: Player) => {
    setPlayers(prev => prev.map(p => p.id === updated.id ? updated : p));
    await supabase.from('sf_players').update(updated).eq('id', updated.id);
  };

  const deletePlayer = async (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    await supabase.from('sf_players').delete().eq('id', id);
  };

  const addMatch = async (match: MatchRecord) => {
    setMatches(prev => [...prev, match]);
    await supabase.from('sf_matches').insert([match]);
  };

  const updateMatch = async (updated: MatchRecord) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    await supabase.from('sf_matches').update(updated).eq('id', updated.id);
  };

  const deleteMatch = async (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    await supabase.from('sf_matches').delete().eq('id', id);
  };

  return {
    players,
    matches,
    loading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    addMatch,
    updateMatch,
    deleteMatch
  };
}
