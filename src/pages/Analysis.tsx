import React, { useState, useEffect, useRef } from "react";
import { AnalysisSession, UserResponse } from "@/entities/all";
import { User } from "@/entities/User";
import { InvokeLLM, UploadFile, GeneratePDFAnalysis } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  CheckCircle,
  Brain,
  Volume2,
  Loader2,
  FileText,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AudioRecorder from "@/components/analysis/AudioRecorder";
import QuestionDisplay from "@/components/analysis/QuestionDisplay";
import TranscriptionDisplay from "@/components/analysis/TranscriptionDisplay";

// 108 perguntas do protocolo Clara R. organizadas por domínios
const DNA_ANALYSIS_QUESTIONS = [
  // Domínio 1: Identidade e Autoconsciência (12 perguntas)
  {
    id: 1,
    domain: "Identidade e Autoconsciência",
    text: "Descreva como você se vê fundamentalmente. Qual é a sua essência mais profunda?",
    audioUrl: "https://example.com/audio/q001.mp3"
  },
  {
    id: 2,
    domain: "Identidade e Autoconsciência",
    text: "Como você calibra sua 'bússola interna'? O que determina seu 'norte de sentido'?",
    audioUrl: "https://example.com/audio/q002.mp3"
  },
  {
    id: 3,
    domain: "Identidade e Autoconsciência",
    text: "Qual é a tensão mais constante em sua vida? Como ela se manifesta no dia a dia?",
    audioUrl: "https://example.com/audio/q003.mp3"
  },
  {
    id: 4,
    domain: "Identidade e Autoconsciência",
    text: "Quando você se sente mais autêntico? Descreva esse estado.",
    audioUrl: "https://example.com/audio/q004.mp3"
  },
  {
    id: 5,
    domain: "Identidade e Autoconsciência",
    text: "Como você lida com a contradição entre quem você é e quem o mundo espera que você seja?",
    audioUrl: "https://example.com/audio/q005.mp3"
  },
  {
    id: 6,
    domain: "Identidade e Autoconsciência",
    text: "Qual é o seu maior medo sobre ser verdadeiramente conhecido por alguém?",
    audioUrl: "https://example.com/audio/q006.mp3"
  },
  {
    id: 7,
    domain: "Identidade e Autoconsciência",
    text: "Como você define liberdade? E como isso impacta suas decisões?",
    audioUrl: "https://example.com/audio/q007.mp3"
  },
  {
    id: 8,
    domain: "Identidade e Autoconsciência",
    text: "Descreva um momento em que você teve que escolher entre sua integridade e a aceitação dos outros.",
    audioUrl: "https://example.com/audio/q008.mp3"
  },
  {
    id: 9,
    domain: "Identidade e Autoconsciência",
    text: "O que significa para você 'crescer' como pessoa? Como você mede seu próprio desenvolvimento?",
    audioUrl: "https://example.com/audio/q009.mp3"
  },
  {
    id: 10,
    domain: "Identidade e Autoconsciência",
    text: "Como você reconcilia suas diferentes 'versões' em contextos diferentes (trabalho, família, amigos)?",
    audioUrl: "https://example.com/audio/q010.mp3"
  },
  {
    id: 11,
    domain: "Identidade e Autoconsciência",
    text: "Qual aspecto de si mesmo você mais tenta esconder? Por quê?",
    audioUrl: "https://example.com/audio/q011.mp3"
  },
  {
    id: 12,
    domain: "Identidade e Autoconsciência",
    text: "Se você pudesse mudar uma característica fundamental sua, qual seria e por quê?",
    audioUrl: "https://example.com/audio/q012.mp3"
  },

  // Domínio 2: Relacionamentos e Conexões (12 perguntas)
  {
    id: 13,
    domain: "Relacionamentos e Conexões",
    text: "Como você estabelece confiança com alguém? Qual é seu processo?",
    audioUrl: "https://example.com/audio/q013.mp3"
  },
  {
    id: 14,
    domain: "Relacionamentos e Conexões",
    text: "Descreva a tensão entre sua necessidade de intimidade e sua necessidade de espaço.",
    audioUrl: "https://example.com/audio/q014.mp3"
  },
  {
    id: 15,
    domain: "Relacionamentos e Conexões",
    text: "Como você lida com o conflito em relacionamentos próximos?",
    audioUrl: "https://example.com/audio/q015.mp3"
  },
  {
    id: 16,
    domain: "Relacionamentos e Conexões",
    text: "Que tipo de pessoa naturalmente se sente atraída por você? E você por ela?",
    audioUrl: "https://example.com/audio/q016.mp3"
  },
  {
    id: 17,
    domain: "Relacionamentos e Conexões",
    text: "Como você expressa amor e cuidado? E como prefere recebê-los?",
    audioUrl: "https://example.com/audio/q017.mp3"
  },
  {
    id: 18,
    domain: "Relacionamentos e Conexões",
    text: "Descreva um relacionamento que mudou fundamentalmente como você se vê.",
    audioUrl: "https://example.com/audio/q018.mp3"
  },
  {
    id: 19,
    domain: "Relacionamentos e Conexões",
    text: "Como você lida com a perda ou o fim de relacionamentos importantes?",
    audioUrl: "https://example.com/audio/q019.mp3"
  },
  {
    id: 20,
    domain: "Relacionamentos e Conexões",
    text: "Qual é o papel que você naturalmente assume em grupos? Por quê?",
    audioUrl: "https://example.com/audio/q020.mp3"
  },
  {
    id: 21,
    domain: "Relacionamentos e Conexões",
    text: "Como você diferencia entre solidão e solitude? Qual prefere?",
    audioUrl: "https://example.com/audio/q021.mp3"
  },
  {
    id: 22,
    domain: "Relacionamentos e Conexões",
    text: "Descreva alguém que você admira profundamente. O que isso revela sobre você?",
    audioUrl: "https://example.com/audio/q022.mp3"
  },
  {
    id: 23,
    domain: "Relacionamentos e Conexões",
    text: "Como você estabelece limites saudáveis sem se sentir culpado?",
    audioUrl: "https://example.com/audio/q023.mp3"
  },
  {
    id: 24,
    domain: "Relacionamentos e Conexões",
    text: "Qual é o maior sacrifício que você já fez por um relacionamento? Valeu a pena?",
    audioUrl: "https://example.com/audio/q024.mp3"
  },

  // Domínio 3: Emoções e Processamento Interno (12 perguntas)
  {
    id: 25,
    domain: "Emoções e Processamento Interno",
    text: "Como você reconhece e nomeia suas emoções? Qual é seu processo interno?",
    audioUrl: "https://example.com/audio/q025.mp3"
  },
  {
    id: 26,
    domain: "Emoções e Processamento Interno",
    text: "Descreva sua relação com a raiva. Como ela se manifesta e como você a processa?",
    audioUrl: "https://example.com/audio/q026.mp3"
  },
  {
    id: 27,
    domain: "Emoções e Processamento Interno",
    text: "Quando você chora? O que isso representa para você?",
    audioUrl: "https://example.com/audio/q027.mp3"
  },
  {
    id: 28,
    domain: "Emoções e Processamento Interno",
    text: "Como você lida com a ansiedade e o estresse? Quais são suas estratégias?",
    audioUrl: "https://example.com/audio/q028.mp3"
  },
  {
    id: 29,
    domain: "Emoções e Processamento Interno",
    text: "Descreva um momento de alegria pura. O que a provocou e como você a expressou?",
    audioUrl: "https://example.com/audio/q029.mp3"
  },
  {
    id: 30,
    domain: "Emoções e Processamento Interno",
    text: "Como você diferencia entre intuição e impulso emocional?",
    audioUrl: "https://example.com/audio/q030.mp3"
  },
  {
    id: 31,
    domain: "Emoções e Processamento Interno",
    text: "Qual emoção você tem mais dificuldade em expressar? Por quê?",
    audioUrl: "https://example.com/audio/q031.mp3"
  },
  {
    id: 32,
    domain: "Emoções e Processamento Interno",
    text: "Como você se reconecta consigo mesmo quando se sente desconectado?",
    audioUrl: "https://example.com/audio/q032.mp3"
  },
  {
    id: 33,
    domain: "Emoções e Processamento Interno",
    text: "Descreva um momento em que você sentiu uma emoção contraditória. Como você processou isso?",
    audioUrl: "https://example.com/audio/q033.mp3"
  },
  {
    id: 34,
    domain: "Emoções e Processamento Interno",
    text: "Como o seu corpo sinaliza diferentes estados emocionais? Você percebe esses sinais?",
    audioUrl: "https://example.com/audio/q034.mp3"
  },
  {
    id: 35,
    domain: "Emoções e Processamento Interno",
    text: "Qual é a diferença entre estar sozinho e se sentir só para você?",
    audioUrl: "https://example.com/audio/q035.mp3"
  },
  {
    id: 36,
    domain: "Emoções e Processamento Interno",
    text: "Como você processa decepções? Qual é seu mecanismo de recuperação?",
    audioUrl: "https://example.com/audio/q036.mp3"
  },

  // Domínio 4: Valores e Sistema de Crenças (12 perguntas)
  {
    id: 37,
    domain: "Valores e Sistema de Crenças",
    text: "Quais são os três valores mais importantes que guiam sua vida? Por que esses?",
    audioUrl: "https://example.com/audio/q037.mp3"
  },
  {
    id: 38,
    domain: "Valores e Sistema de Crenças",
    text: "Descreva um momento em que seus valores foram testados. Como você reagiu?",
    audioUrl: "https://example.com/audio/q038.mp3"
  },
  {
    id: 39,
    domain: "Valores e Sistema de Crenças",
    text: "Como você define justiça? E como isso influencia suas ações?",
    audioUrl: "https://example.com/audio/q039.mp3"
  },
  {
    id: 40,
    domain: "Valores e Sistema de Crenças",
    text: "Qual crença sua mudou mais dramaticamente ao longo da vida?",
    audioUrl: "https://example.com/audio/q040.mp3"
  },
  {
    id: 41,
    domain: "Valores e Sistema de Crenças",
    text: "Como você lida com situações moralmente ambíguas?",
    audioUrl: "https://example.com/audio/q041.mp3"
  },
  {
    id: 42,
    domain: "Valores e Sistema de Crenças",
    text: "O que você considera inegociável em sua vida? Por quê?",
    audioUrl: "https://example.com/audio/q042.mp3"
  },
  {
    id: 43,
    domain: "Valores e Sistema de Crenças",
    text: "Como você reconcilia suas crenças pessoais com as expectativas sociais?",
    audioUrl: "https://example.com/audio/q043.mp3"
  },
  {
    id: 44,
    domain: "Valores e Sistema de Crenças",
    text: "Descreva uma situação em que você teve que defender algo em que acredita.",
    audioUrl: "https://example.com/audio/q044.mp3"
  },
  {
    id: 45,
    domain: "Valores e Sistema de Crenças",
    text: "Como você forma suas opiniões? Qual é seu processo de validação interna?",
    audioUrl: "https://example.com/audio/q045.mp3"
  },
  {
    id: 46,
    domain: "Valores e Sistema de Crenças",
    text: "Qual é o papel da compaixão versus justiça em suas decisões?",
    audioUrl: "https://example.com/audio/q046.mp3"
  },
  {
    id: 47,
    domain: "Valores e Sistema de Crenças",
    text: "Como você define sucesso pessoal? E como isso evoluiu ao longo do tempo?",
    audioUrl: "https://example.com/audio/q047.mp3"
  },
  {
    id: 48,
    domain: "Valores e Sistema de Crenças",
    text: "Existe algo que você considera sagrado ou inviolável? O quê?",
    audioUrl: "https://example.com/audio/q048.mp3"
  },

  // Domínio 5: Propósito e Significado (12 perguntas)
  {
    id: 49,
    domain: "Propósito e Significado",
    text: "Como você define propósito? E como descobriu o seu?",
    audioUrl: "https://example.com/audio/q049.mp3"
  },
  {
    id: 50,
    domain: "Propósito e Significado",
    text: "Que tipo de legado você gostaria de deixar? Como isso guia suas ações diárias?",
    audioUrl: "https://example.com/audio/q050.mp3"
  },
  {
    id: 51,
    domain: "Propósito e Significado",
    text: "Descreva um momento em que você se sentiu profundamente conectado com algo maior que você.",
    audioUrl: "https://example.com/audio/q051.mp3"
  },
  {
    id: 52,
    domain: "Propósito e Significado",
    text: "O que dá significado aos seus dias mais comuns?",
    audioUrl: "https://example.com/audio/q052.mp3"
  },
  {
    id: 53,
    domain: "Propósito e Significado",
    text: "Como você equilibra ambição pessoal com contribuição para os outros?",
    audioUrl: "https://example.com/audio/q053.mp3"
  },
  {
    id: 54,
    domain: "Propósito e Significado",
    text: "Qual é a diferença entre fazer algo bem e fazer algo que importa para você?",
    audioUrl: "https://example.com/audio/q054.mp3"
  },
  {
    id: 55,
    domain: "Propósito e Significado",
    text: "Como você lida com períodos em que seu sentido de propósito fica nebuloso?",
    audioUrl: "https://example.com/audio/q055.mp3"
  },
  {
    id: 56,
    domain: "Propósito e Significado",
    text: "Descreva uma experiência que redefiniu completamente o que você considera importante.",
    audioUrl: "https://example.com/audio/q056.mp3"
  },
  {
    id: 57,
    domain: "Propósito e Significado",
    text: "Como você diferencia entre propósito imposto externamente e propósito autêntico?",
    audioUrl: "https://example.com/audio/q057.mp3"
  },
  {
    id: 58,
    domain: "Propósito e Significado",
    text: "Qual é o papel do sofrimento na construção do significado de sua vida?",
    audioUrl: "https://example.com/audio/q058.mp3"
  },
  {
    id: 59,
    domain: "Propósito e Significado",
    text: "Como você sabe quando está alinhado com seu propósito verdadeiro?",
    audioUrl: "https://example.com/audio/q059.mp3"
  },
  {
    id: 60,
    domain: "Propósito e Significado",
    text: "Se você fosse lembrado por apenas uma contribuição, qual gostaria que fosse?",
    audioUrl: "https://example.com/audio/q060.mp3"
  },

  // Domínio 6: Processo de Tomada de Decisão (12 perguntas)
  {
    id: 61,
    domain: "Processo de Tomada de Decisão",
    text: "Descreva seu processo interno quando enfrenta uma decisão importante.",
    audioUrl: "https://example.com/audio/q061.mp3"
  },
  {
    id: 62,
    domain: "Processo de Tomada de Decisão",
    text: "Como você equilibra lógica e intuição em suas escolhas?",
    audioUrl: "https://example.com/audio/q062.mp3"
  },
  {
    id: 63,
    domain: "Processo de Tomada de Decisão",
    text: "Qual é o papel do medo em suas decisões? Como você o gerencia?",
    audioUrl: "https://example.com/audio/q063.mp3"
  },
  {
    id: 64,
    domain: "Processo de Tomada de Decisão",
    text: "Descreva uma decisão que você tomou que surpreendeu até você mesmo.",
    audioUrl: "https://example.com/audio/q064.mp3"
  },
  {
    id: 65,
    domain: "Processo de Tomada de Decisão",
    text: "Como você lida com a paralisia da análise excessiva?",
    audioUrl: "https://example.com/audio/q065.mp3"
  },
  {
    id: 66,
    domain: "Processo de Tomada de Decisão",
    text: "Que papel as opiniões dos outros desempenham em suas decisões importantes?",
    audioUrl: "https://example.com/audio/q066.mp3"
  },
  {
    id: 67,
    domain: "Processo de Tomada de Decisão",
    text: "Como você reconhece quando uma decisão 'ressoa' verdadeiramente com você?",
    audioUrl: "https://example.com/audio/q067.mp3"
  },
  {
    id: 68,
    domain: "Processo de Tomada de Decisão",
    text: "Descreva um momento em que você teve que escolher entre segurança e crescimento.",
    audioUrl: "https://example.com/audio/q068.mp3"
  },
  {
    id: 69,
    domain: "Processo de Tomada de Decisão",
    text: "Como você lida com as consequências imprevistas de suas decisões?",
    audioUrl: "https://example.com/audio/q069.mp3"
  },
  {
    id: 70,
    domain: "Processo de Tomada de Decisão",
    text: "Qual é sua relação com o arrependimento? Como ele influencia decisões futuras?",
    audioUrl: "https://example.com/audio/q070.mp3"
  },
  {
    id: 71,
    domain: "Processo de Tomada de Decisão",
    text: "Como você diferencia entre compromisso saudável e traição de si mesmo?",
    audioUrl: "https://example.com/audio/q071.mp3"
  },
  {
    id: 72,
    domain: "Processo de Tomada de Decisão",
    text: "Descreva uma situação em que você teve que tomar uma decisão sem informações suficientes.",
    audioUrl: "https://example.com/audio/q072.mp3"
  },

  // Domínio 7: Criatividade e Expressão (12 perguntas)
  {
    id: 73,
    domain: "Criatividade e Expressão",
    text: "Como você define criatividade? Como ela se manifesta em sua vida?",
    audioUrl: "https://example.com/audio/q073.mp3"
  },
  {
    id: 74,
    domain: "Criatividade e Expressão",
    text: "Quando você se sente mais criativamente livre? Descreva esse estado.",
    audioUrl: "https://example.com/audio/q074.mp3"
  },
  {
    id: 75,
    domain: "Criatividade e Expressão",
    text: "Como você lida com bloqueios criativos ou de expressão?",
    audioUrl: "https://example.com/audio/q075.mp3"
  },
  {
    id: 76,
    domain: "Criatividade e Expressão",
    text: "Qual é a relação entre sua necessidade de perfeição e sua expressão criativa?",
    audioUrl: "https://example.com/audio/q076.mp3"
  },
  {
    id: 77,
    domain: "Criatividade e Expressão",
    text: "Como você decide quando algo que criou está 'pronto' para ser compartilhado?",
    audioUrl: "https://example.com/audio/q077.mp3"
  },
  {
    id: 78,
    domain: "Criatividade e Expressão",
    text: "Descreva um momento em que você criou algo que surpreendeu você mesmo.",
    audioUrl: "https://example.com/audio/q078.mp3"
  },
  {
    id: 79,
    domain: "Criatividade e Expressão",
    text: "Como você equilibra influências externas com sua voz autêntica?",
    audioUrl: "https://example.com/audio/q079.mp3"
  },
  {
    id: 80,
    domain: "Criatividade e Expressão",
    text: "Qual é o papel da vulnerabilidade em sua expressão criativa?",
    audioUrl: "https://example.com/audio/q080.mp3"
  },
  {
    id: 81,
    domain: "Criatividade e Expressão",
    text: "Como você lida com críticas ou incompreensão sobre sua expressão?",
    audioUrl: "https://example.com/audio/q081.mp3"
  },
  {
    id: 82,
    domain: "Criatividade e Expressão",
    text: "Existe algo que você sempre quis criar mas nunca ousou? Por quê?",
    audioUrl: "https://example.com/audio/q082.mp3"
  },
  {
    id: 83,
    domain: "Criatividade e Expressão",
    text: "Como você reconhece quando está sendo verdadeiramente original versus imitativo?",
    audioUrl: "https://example.com/audio/q083.mp3"
  },
  {
    id: 84,
    domain: "Criatividade e Expressão",
    text: "Qual é a diferença entre criar para você mesmo e criar para os outros?",
    audioUrl: "https://example.com/audio/q084.mp3"
  },

  // Domínio 8: Crescimento e Transformação (12 perguntas)
  {
    id: 85,
    domain: "Crescimento e Transformação",
    text: "Como você reconhece quando precisa mudar algo fundamental em sua vida?",
    audioUrl: "https://example.com/audio/q085.mp3"
  },
  {
    id: 86,
    domain: "Crescimento e Transformação",
    text: "Descreva sua relação com o desconforto do crescimento pessoal.",
    audioUrl: "https://example.com/audio/q086.mp3"
  },
  {
    id: 87,
    domain: "Crescimento e Transformação",
    text: "Como você diferencia entre resistência natural e resistência necessária à mudança?",
    audioUrl: "https://example.com/audio/q087.mp3"
  },
  {
    id: 88,
    domain: "Crescimento e Transformação",
    text: "Qual foi a transformação mais difícil que você já passou? O que aprendeu?",
    audioUrl: "https://example.com/audio/q088.mp3"
  },
  {
    id: 89,
    domain: "Crescimento e Transformação",
    text: "Como você mantém sua identidade essencial durante períodos de grande mudança?",
    audioUrl: "https://example.com/audio/q089.mp3"
  },
  {
    id: 90,
    domain: "Crescimento e Transformação",
    text: "Qual é o papel do fracasso em seu processo de crescimento?",
    audioUrl: "https://example.com/audio/q090.mp3"
  },
  {
    id: 91,
    domain: "Crescimento e Transformação",
    text: "Como você celebra seu progresso pessoal? Você reconhece suas conquistas?",
    audioUrl: "https://example.com/audio/q091.mp3"
  },
  {
    id: 92,
    domain: "Crescimento e Transformação",
    text: "Descreva um padrão antigo que você conseguiu quebrar. Como foi o processo?",
    audioUrl: "https://example.com/audio/q092.mp3"
  },
  {
    id: 93,
    domain: "Crescimento e Transformação",
    text: "Como você equilibra aceitação de si mesmo com o desejo de melhorar?",
    audioUrl: "https://example.com/audio/q093.mp3"
  },
  {
    id: 94,
    domain: "Crescimento e Transformação",
    text: "Qual aspecto seu você mais deseja desenvolver nos próximos anos?",
    audioUrl: "https://example.com/audio/q094.mp3"
  },
  {
    id: 95,
    domain: "Crescimento e Transformação",
    text: "Como você lida com recaídas em comportamentos que pensava ter superado?",
    audioUrl: "https://example.com/audio/q095.mp3"
  },
  {
    id: 96,
    domain: "Crescimento e Transformação",
    text: "Descreva um momento em que você percebeu que havia mudado profundamente.",
    audioUrl: "https://example.com/audio/q096.mp3"
  },

  // Domínio 9: Visão de Futuro e Legado (12 perguntas)
  {
    id: 97,
    domain: "Visão de Futuro e Legado",
    text: "Como você imagina sua vida daqui a 10 anos? O que mais deseja que seja diferente?",
    audioUrl: "https://example.com/audio/q097.mp3"
  },
  {
    id: 98,
    domain: "Visão de Futuro e Legado",
    text: "Que conselho você daria para sua versão mais jovem? E que pergunta faria?",
    audioUrl: "https://example.com/audio/q098.mp3"
  },
  {
    id: 99,
    domain: "Visão de Futuro e Legado",
    text: "Como você gostaria de ser lembrado pelas pessoas que ama?",
    audioUrl: "https://example.com/audio/q099.mp3"
  },
  {
    id: 100,
    domain: "Visão de Futuro e Legado",
    text: "Qual é sua maior esperança para o mundo que deixará para as próximas gerações?",
    audioUrl: "https://example.com/audio/q100.mp3"
  },
  {
    id: 101,
    domain: "Visão de Futuro e Legado",
    text: "Se você soubesse que tem apenas um ano de vida, o que priorizaria?",
    audioUrl: "https://example.com/audio/q101.mp3"
  },
  {
    id: 102,
    domain: "Visão de Futuro e Legado",
    text: "Como você define uma vida bem vivida? Você está no caminho certo?",
    audioUrl: "https://example.com/audio/q102.mp3"
  },
  {
    id: 103,
    domain: "Visão de Futuro e Legado",
    text: "Qual é o maior risco que você gostaria de ter coragem de assumir?",
    audioUrl: "https://example.com/audio/q103.mp3"
  },
  {
    id: 104,
    domain: "Visão de Futuro e Legado",
    text: "Como você espera que sua perspectiva sobre a vida continue evoluindo?",
    audioUrl: "https://example.com/audio/q104.mp3"
  },
  {
    id: 105,
    domain: "Visão de Futuro e Legado",
    text: "Se pudesse plantar uma semente de ideia na humanidade, qual seria?",
    audioUrl: "https://example.com/audio/q105.mp3"
  },
  {
    id: 106,
    domain: "Visão de Futuro e Legado",
    text: "Qual é a diferença entre estar vivo e estar verdadeiramente vivendo para você?",
    audioUrl: "https://example.com/audio/q106.mp3"
  },
  {
    id: 107,
    domain: "Visão de Futuro e Legado",
    text: "Como você quer que sua história pessoal inspire ou toque outras pessoas?",
    audioUrl: "https://example.com/audio/q107.mp3"
  },
  {
    id: 108,
    domain: "Visão de Futuro e Legado",
    text: "Olhando para trás, qual foi o maior presente que a vida lhe deu? E qual o maior presente que você deu para a vida?",
    audioUrl: "https://example.com/audio/q108.mp3"
  }
];

export default function Analysis() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
     
      // Verificar se existe sessão ativa
      const activeSessions = await AnalysisSession.filter(
        { user_email: currentUser.email, status: 'active' },
        '-created_date',
        1
      );

      if (activeSessions.length > 0) {
        // Continuar sessão existente
        const session = activeSessions[0];
        setCurrentSession(session);
        setCurrentQuestionIndex(session.current_question - 1);
      } else {
        // Criar nova sessão
        const session = await AnalysisSession.create({
          user_email: currentUser.email,
          status: "active",
          current_question: 1,
          total_questions: DNA_ANALYSIS_QUESTIONS.length,
          progress_percentage: 0
        });
        setCurrentSession(session);
      }
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  const handleAudioEnded = () => {
    setAudioEnded(true);
  };

  const handleRecordingComplete = async (audioBlob, duration) => {
    if (!currentSession) return;
   
    setIsProcessing(true);
   
    try {
      const currentQuestion = DNA_ANALYSIS_QUESTIONS[currentQuestionIndex];
      
      // Upload audio para Google Drive do administrador
      const audioFile = new File([audioBlob], `${user.email}_q${currentQuestionIndex + 1}_${Date.now()}.mp3`, {
        type: 'audio/mp3'
      });
     
      const { file_url, drive_file_id } = await UploadFile({ 
        file: audioFile,
        userEmail: user.email,
        questionIndex: currentQuestionIndex + 1
      });
     
      // Gerar transcrição usando Deepgram
      const transcriptionResult = await InvokeLLM({
        prompt: `Transcreva com alta precisão o áudio fornecido. A pessoa estava respondendo à pergunta: "${currentQuestion.text}". Retorne apenas a transcrição fiel do que foi dito, mantendo pausas naturais e expressões.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            transcription: { type: "string" },
            duration_seconds: { type: "number" },
            confidence_score: { type: "number" },
            emotional_tone: { type: "string" },
            keywords: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Salvar resposta no banco de dados
      await UserResponse.create({
        session_id: currentSession.id,
        question_index: currentQuestionIndex + 1,
        question_text: currentQuestion.text,
        question_domain: currentQuestion.domain,
        transcript_text: transcriptionResult.transcription || "Transcrição em processamento...",
        audio_duration: duration,
        audio_file_url: file_url,
        drive_file_id: drive_file_id,
        analysis_keywords: transcriptionResult.keywords || [],
        sentiment_score: 0,
        emotional_tone: transcriptionResult.emotional_tone || null
      });

      setTranscript(transcriptionResult.transcription || "Transcrição em processamento...");
     
      // Atualizar estatísticas do usuário
      await User.updateStats(user.email, {
        total_responses: user.total_responses + 1,
        total_audio_time: user.total_audio_time + duration
      });

      setTimeout(() => {
        handleNextQuestion();
      }, 3000);
     
    } catch (error) {
      console.error("Error processing recording:", error);
      setTranscript("Erro ao processar a gravação. Tente novamente.");
    }
   
    setIsProcessing(false);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < DNA_ANALYSIS_QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const progressPercentage = Math.round(((nextIndex + 1) / DNA_ANALYSIS_QUESTIONS.length) * 100);
      
      setCurrentQuestionIndex(nextIndex);
      setTranscript("");
      setAudioEnded(false);
     
      await AnalysisSession.update(currentSession.id, {
        current_question: nextIndex + 1,
        progress_percentage: progressPercentage
      });
    } else {
      // Completar sessão e gerar análise
      await completeSessionAndGenerateAnalysis();
    }
  };

  const completeSessionAndGenerateAnalysis = async () => {
    setIsGeneratingReport(true);
   
    try {
      // Buscar todas as respostas da sessão
      const responses = await UserResponse.filter({ session_id: currentSession.id });
     
      // Compilar todas as transcrições organizadas por domínio
      const responsesByDomain = {};
      responses.forEach(response => {
        if (!responsesByDomain[response.question_domain]) {
          responsesByDomain[response.question_domain] = [];
        }
        responsesByDomain[response.question_domain].push(response);
      });

      const compiledAnalysis = Object.keys(responsesByDomain).map(domain => {
        const domainResponses = responsesByDomain[domain]
          .sort((a, b) => a.question_index - b.question_index)
          .map(r => `PERGUNTA ${r.question_index}: ${r.question_text}\n\nRESPOSTA: ${r.transcript_text}\n\n---\n\n`)
          .join('');
        
        return `## DOMÍNIO: ${domain}\n\n${domainResponses}`;
      }).join('\n\n');

      // Gerar análise psicológica completa usando o protocolo Clara R.
      const analysisResult = await InvokeLLM({
        prompt: `# Prompt para Extração de Informações e Criação de Clone Digital

## CONTEXTO E OBJETIVO
Você é um sistema especializado em análise de personalidade e criação de representações digitais. Sua tarefa é analisar cuidadosamente as 108 respostas fornecidas do protocolo Clara R. e extrair informações detalhadas para criar uma representação digital precisa da pessoa.

## MATERIAL PARA ANÁLISE:
${compiledAnalysis}

## INSTRUÇÕES DE PROCESSAMENTO

### FASE 1: ANÁLISE INICIAL DO CORPUS
- Identifique todos os padrões de resposta por domínio
- Determine a consistência e profundidade das respostas
- Avalie a autenticidade e coerência do material
- Identifique temas centrais e metáforas recorrentes

### FASE 2: EXTRAÇÃO DE CARACTERÍSTICAS FUNDAMENTAIS

#### 1. PERFIL DE PERSONALIDADE
- **Estilo de Comunicação**: Analise formal vs. informal, direto vs. elaborativo, uso de humor, expressões características
- **Padrões de Pensamento**: Linear vs. não-linear, analítico vs. intuitivo, concreto vs. abstrato
- **Resposta Emocional**: Gatilhos emocionais, regulação emocional, padrões de engajamento
- **Postura Social**: Introversão vs. extroversão, estilo de liderança, preferências de interação

#### 2. SISTEMA DE CRENÇAS E VALORES
- **Valores Fundamentais**: Hierarquia de valores, princípios éticos
- **Crenças Sobre o Mundo**: Visões sobre natureza humana, sistemas, progresso
- **Filosofia Pessoal**: Abordagem à tomada de decisão, atitudes sobre risco
- **Evolução de Pensamento**: Mudanças detectáveis em crenças ao longo do tempo

#### 3. DOMÍNIO DE CONHECIMENTO
- **Áreas de Expertise**: Domínios de conhecimento especializado
- **Interesses Intelectuais**: Temas de curiosidade recorrente
- **Lacunas de Conhecimento**: Áreas evitadas ou desconhecidas

#### 4. MOTIVAÇÕES E INTENÇÕES
- **Objetivos Expressos**: Metas de curto e longo prazo
- **Motivadores Internos**: Fontes de significado e propósito
- **Aversões e Evitações**: Situações ou resultados ativamente evitados

#### 5. CONTEXTO BIOGRÁFICO RELEVANTE
- **Experiências Formativas**: Eventos mencionados como significativos
- **Trajetória Profissional**: Filosofia de trabalho e carreira
- **Relacionamentos Chave**: Dinâmicas interpessoais recorrentes

### FASE 3: ANÁLISE DE PADRÕES LINGUÍSTICOS
- **Vocabulário Característico**: Palavras e frases frequentes
- **Estrutura de Texto**: Padrões de argumentação
- **Marcadores Estilísticos**: Uso de humor, ironia, formalidade

### FASE 4: SÍNTESE E MODELAGEM
Desenvolva:
1. **Perfil Condensado**: Resumo de 2-3 parágrafos da essência da personalidade
2. **Modelo de Comportamento**: Como o sujeito responderia em situações específicas
3. **Diretrizes de Resposta**: Regras para diferentes contextos
4. **Exemplos de Diálogo**: 5-7 exemplos de respostas baseadas em evidências

## ETAPA FINAL: META-AVALIAÇÃO
- Avalie a confiabilidade do modelo
- Identifique áreas onde mais dados seriam necessários
- Estime a precisão em diferentes domínios

## FORMATO DE SAÍDA
Organize em documento estruturado com as 10 seções especificadas.

Seja extremamente detalhado, use exemplos específicos das respostas, e crie um modelo de alta fidelidade que capture verdadeiramente a essência única desta pessoa.`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis_document: { type: "string" },
            personality_summary: { type: "string" },
            key_insights: { type: "array", items: { type: "string" } },
            behavioral_patterns: { type: "array", items: { type: "string" } },
            recommendations: { type: "string" },
            confidence_score: { type: "number" },
            domain_analysis: { type: "object" }
          }
        }
      });

      // Gerar PDF da análise e salvar no Google Drive
      const pdfResult = await GeneratePDFAnalysis({
        userEmail: user.email,
        analysisData: analysisResult,
        responses: responses
      });

      // Atualizar sessão com análise final e PDF
      await AnalysisSession.update(currentSession.id, {
        status: "completed",
        progress_percentage: 100,
        final_synthesis: analysisResult.analysis_document || "Análise completa gerada com sucesso.",
        pdf_file_url: pdfResult.pdf_url
      });

      // Atualizar estatísticas do usuário
      await User.updateStats(user.email, {
        completed_sessions: user.completed_sessions + 1
      });

      setSessionCompleted(true);
     
    } catch (error) {
      console.error("Error generating analysis:", error);
    }
   
    setIsGeneratingReport(false);
  };

  const progress = ((currentQuestionIndex + 1) / DNA_ANALYSIS_QUESTIONS.length) * 100;
  const currentDomain = DNA_ANALYSIS_QUESTIONS[currentQuestionIndex]?.domain;

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Gerando Análise Completa
              </h2>
              <p className="text-slate-600 mb-6">
                Processando suas 108 respostas para criar seu perfil psicológico detalhado e gerando documento PDF...
              </p>
              <div className="text-sm text-slate-500">
                Este processo pode levar alguns minutos
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Análise DNA Concluída!
              </h2>
              <p className="text-slate-600 mb-6">
                Suas 108 respostas foram processadas e sua análise psicológica completa foi gerada com sucesso. O documento PDF foi criado e armazenado de forma segura.
              </p>
              <div className="space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Análise Completa Gerada</span>
                  </div>
                  <p className="text-sm text-amber-600 mt-1">
                    Documento PDF com análise detalhada foi criado
                  </p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("Dashboard"))}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                  Finalizar Sessão
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
       
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
         
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Análise DNA Completa</h1>
            <p className="text-slate-600">
              Pergunta {currentQuestionIndex + 1} de {DNA_ANALYSIS_QUESTIONS.length}
            </p>
            <p className="text-sm text-amber-600 font-medium">
              {currentDomain}
            </p>
          </div>
         
          <div className="w-20" />
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Progress
            value={progress}
            className="h-4 bg-slate-200"
          />
          <div className="flex justify-between text-sm text-slate-500 mt-2">
            <span>{Math.round(progress)}% concluído</span>
            <span>{DNA_ANALYSIS_QUESTIONS.length - currentQuestionIndex - 1} perguntas restantes</span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
         
          {/* Question Display */}
          <QuestionDisplay
            question={DNA_ANALYSIS_QUESTIONS[currentQuestionIndex].text}
            audioUrl={DNA_ANALYSIS_QUESTIONS[currentQuestionIndex].audioUrl}
            questionNumber={currentQuestionIndex + 1}
            domain={currentDomain}
            onAudioEnded={handleAudioEnded}
          />

          {/* Audio Recorder - Only show after audio ends */}
          <AnimatePresence>
            {audioEnded && (
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
                disabled={isProcessing}
              />
            )}
          </AnimatePresence>

          {/* Transcription Display */}
          <AnimatePresence>
            {transcript && (
              <TranscriptionDisplay
                transcript={transcript}
                isProcessing={isProcessing}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}