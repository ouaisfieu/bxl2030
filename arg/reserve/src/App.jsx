import { useState, useEffect } from 'react';
import { Users, UserPlus, Search, HelpCircle, Heart, Globe, Sparkles, ChevronDown, ChevronUp, Check, Clock, Star, Zap, Coffee } from 'lucide-react';

const PROMPT_INITIAL = `Contexte : Création d'une réserve de recrutement pour la SCP 329.02

Demande utilisateur :
- Outil de productivité pour gérer une réserve de recrutement
- Grand public, tous profils valorisés selon moyens de l'équipe bénévole
- Critères : motivation et curiosité
- Rien d'obligatoire sauf IBAN si cotisation crypto éthique (12,50€/an)
- Ouvert et évolutif
- Objectif : connecter les gens plutôt que faire chasseur de tête
- Transparence totale : ce prompt doit figurer dans la FAQ`;

const STATUTS = [
  { id: 'nouveau', label: 'Nouveau', color: 'bg-blue-100 text-blue-800', icon: Sparkles },
  { id: 'en_lecture', label: 'En lecture', color: 'bg-yellow-100 text-yellow-800', icon: Coffee },
  { id: 'contact_initie', label: 'Contact initié', color: 'bg-purple-100 text-purple-800', icon: Zap },
  { id: 'en_echange', label: 'En échange', color: 'bg-indigo-100 text-indigo-800', icon: Heart },
  { id: 'connecte', label: 'Connecté·e', color: 'bg-green-100 text-green-800', icon: Check },
  { id: 'en_pause', label: 'En pause', color: 'bg-gray-100 text-gray-800', icon: Clock },
  { id: 'ambassadeur', label: 'Ambassadeur·rice', color: 'bg-amber-100 text-amber-800', icon: Star },
  { id: 'lorem_alpha', label: 'Lorem Alpha', color: 'bg-pink-100 text-pink-800', icon: Globe },
  { id: 'lorem_beta', label: 'Lorem Beta', color: 'bg-teal-100 text-teal-800', icon: Globe },
  { id: 'lorem_gamma', label: 'Lorem Gamma', color: 'bg-orange-100 text-orange-800', icon: Globe },
];

const storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }},
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterCotisant, setFilterCotisant] = useState('tous');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '', localisation: '',
    motivation: '', curiosite: '', competences: '', disponibilite: '',
    commentaire: '', cotisant: false, iban: '', linkedin: '', site: ''
  });

  useEffect(() => { setProfiles(storage.get('scp329-profiles')); }, []);

  const saveProfiles = (p) => { setProfiles(p); storage.set('scp329-profiles', p); };

  const handleSubmit = () => {
    if (!form.cotisant || form.iban.trim()) {
      const newProfile = { ...form, id: Date.now(), statut: 'nouveau', dateInscription: new Date().toISOString(), evaluationMotivation: 0, evaluationCuriosite: 0 };
      saveProfiles([...profiles, newProfile]);
      setForm({ nom: '', prenom: '', email: '', telephone: '', localisation: '', motivation: '', curiosite: '', competences: '', disponibilite: '', commentaire: '', cotisant: false, iban: '', linkedin: '', site: '' });
      setView('dashboard');
    }
  };

  const updateProfile = (id, updates) => saveProfiles(profiles.map(p => p.id === id ? { ...p, ...updates } : p));
  const deleteProfile = (id) => { if (confirm('Supprimer ce profil ?')) saveProfiles(profiles.filter(p => p.id !== id)); };

  const filtered = profiles.filter(p => {
    const matchSearch = !searchTerm || Object.values(p).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatut = filterStatut === 'tous' || p.statut === filterStatut;
    const matchCotisant = filterCotisant === 'tous' || (filterCotisant === 'oui' ? p.cotisant : !p.cotisant);
    return matchSearch && matchStatut && matchCotisant;
  });

  const stats = { total: profiles.length, cotisants: profiles.filter(p => p.cotisant).length, connectes: profiles.filter(p => p.statut === 'connecte').length };

  const faqItems = [
    { q: "C'est quoi la SCP 329.02 ?", a: "Une initiative collaborative ouverte à tous, portée par une équipe bénévole. Notre mission : connecter les personnes plutôt que faire du recrutement traditionnel." },
    { q: "Comment sont évalués les profils ?", a: "Selon deux critères principaux : la motivation et la curiosité. L'évaluation est faite selon les moyens disponibles de l'équipe bénévole, avec bienveillance et ouverture." },
    { q: "Qu'est-ce que la cotisation crypto éthique ?", a: "Une cotisation optionnelle de 12,50€/an qui soutient le projet. L'IBAN n'est requis que si vous choisissez de cotiser." },
    { q: "Mes données sont-elles sécurisées ?", a: "Vos données sont stockées localement dans votre navigateur. Rien n'est obligatoire sauf l'IBAN pour les cotisants. Transparence totale : même le prompt de création est public." },
    { q: "Quel est le prompt initial de cet outil ?", a: PROMPT_INITIAL }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <Globe className="w-7 h-7 text-blue-600" />Réserve SCP 329.02
          </h1>
          <p className="text-slate-600 text-sm">Connecter les gens, valoriser tous les profils</p>
        </header>

        <nav className="flex justify-center gap-2 mb-6 flex-wrap">
          {[{ id: 'dashboard', icon: Users, label: 'Tableau de bord' }, { id: 'inscription', icon: UserPlus, label: "S'inscrire" }, { id: 'faq', icon: HelpCircle, label: 'FAQ' }].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setView(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${view === id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-blue-50'}`}>
              <Icon className="w-4 h-4" /><span className="text-sm">{label}</span>
            </button>
          ))}
        </nav>

        {view === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Profils', value: stats.total, c: 'text-blue-500' }, { label: 'Cotisants', value: stats.cotisants, c: 'text-green-500' }, { label: 'Connecté·es', value: stats.connectes, c: 'text-purple-500' }].map(s => (
                <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm"><div className={`text-2xl font-bold ${s.c}`}>{s.value}</div><div className="text-xs text-slate-600">{s.label}</div></div>
              ))}
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-48 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" />
                </div>
                <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="tous">Tous statuts</option>
                  {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <select value={filterCotisant} onChange={e => setFilterCotisant(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                  <option value="tous">Cotisation</option><option value="oui">Cotisants</option><option value="non">Non-cotisants</option>
                </select>
              </div>
              {filtered.length === 0 ? <p className="text-center text-slate-500 py-8">Aucun profil {profiles.length === 0 ? "– inscrivez-vous !" : 'trouvé'}</p> : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filtered.map(p => {
                    const statut = STATUTS.find(s => s.id === p.statut) || STATUTS[0];
                    const Icon = statut.icon;
                    return (
                      <div key={p.id} className="border rounded-lg p-3 hover:bg-slate-50">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-800">{p.prenom || 'Anonyme'} {p.nom}</span>
                              {p.cotisant && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Cotisant</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${statut.color}`}><Icon className="w-3 h-3" />{statut.label}</span>
                            </div>
                            {p.email && <p className="text-xs text-slate-600">{p.email}</p>}
                            {p.motivation && <p className="text-xs text-slate-600 mt-1 italic">"{p.motivation.slice(0, 80)}..."</p>}
                          </div>
                          <div className="flex flex-col gap-1">
                            <select value={p.statut} onChange={e => updateProfile(p.id, { statut: e.target.value })} className="text-xs border rounded px-2 py-1">
                              {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                            <div className="flex gap-1">
                              {['M', 'C'].map((l, i) => (
                                <select key={l} value={p[i === 0 ? 'evaluationMotivation' : 'evaluationCuriosite'] || 0} onChange={e => updateProfile(p.id, { [i === 0 ? 'evaluationMotivation' : 'evaluationCuriosite']: +e.target.value })} className="text-xs border rounded w-14">
                                  {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{l}:{n}/5</option>)}
                                </select>
                              ))}
                            </div>
                            <button onClick={() => deleteProfile(p.id)} className="text-xs text-red-500 hover:text-red-700">Supprimer</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'inscription' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-blue-600" />Rejoindre la réserve</h2>
            <p className="text-sm text-slate-600 mb-4">Tous les champs sont optionnels sauf l'IBAN si vous cotisez.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {['prenom', 'nom', 'email', 'telephone', 'localisation', 'linkedin', 'site', 'disponibilite'].map(k => (
                <div key={k}><label className="text-sm text-slate-700 capitalize">{k}</label><input type="text" value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              ))}
            </div>
            <div className="mt-4 space-y-4">
              {[{ k: 'motivation', p: "Qu'est-ce qui vous attire ?" }, { k: 'curiosite', p: 'Que voulez-vous découvrir ?' }, { k: 'competences', p: 'Ce que vous apportez...' }].map(f => (
                <div key={f.k}><label className="text-sm text-slate-700 capitalize">{f.k}</label><textarea value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})} placeholder={f.p} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.cotisant} onChange={e => setForm({...form, cotisant: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Cotiser pour la crypto éthique (12,50€/an)</span></label>
              {form.cotisant && <div className="mt-3"><label className="text-sm">IBAN <span className="text-red-500">*</span></label><input type="text" value={form.iban} onChange={e => setForm({...form, iban: e.target.value})} placeholder="FR76..." className="w-full border rounded-lg px-3 py-2 text-sm mt-1" /></div>}
            </div>
            <button onClick={handleSubmit} disabled={form.cotisant && !form.iban.trim()} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 transition-all">Envoyer</button>
          </div>
        )}

        {view === 'faq' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-600" />FAQ & Transparence</h2>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50">
                    <span className="font-medium text-slate-800">{item.q}</span>
                    {expandedFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedFaq === i && <div className="px-4 pb-4"><p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded">{item.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="text-center mt-8 text-xs text-slate-500">SCP 329.02 · Équipe bénévole · Transparence & Ouverture</footer>
      </div>
    </div>
  );
}
