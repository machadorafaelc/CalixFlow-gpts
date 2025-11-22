/**
 * PI Comments
 * 
 * Sistema de comentários para PIs
 */

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Send, MessageCircle } from 'lucide-react';
import { PIService } from '../services/piService';
import { useAuth } from '../contexts/AuthContext';
import { PIComment } from '../types/firestore';

interface PICommentsProps {
  piId: string;
}

export function PIComments({ piId }: PICommentsProps) {
  const { user, userProfile } = useAuth();
  const [comments, setComments] = useState<PIComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, [piId]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await PIService.getComments(piId);
      setComments(commentsData);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userProfile || !newComment.trim()) {
      return;
    }

    setLoading(true);
    try {
      await PIService.addComment(
        piId,
        user.uid,
        userProfile.displayName || user.email || 'Usuário',
        newComment.trim(),
        userProfile.photoURL
      );
      
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comentários ({comments.length})
        </h3>
      </div>

      <Separator />

      {/* Lista de comentários */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {loadingComments ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm">Carregando comentários...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="size-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Nenhum comentário ainda</p>
            <p className="text-xs text-gray-400 mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.userPhoto ? (
                    <img
                      src={comment.userPhoto}
                      alt={comment.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-700 font-medium text-sm">
                        {comment.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  
                  {/* Anexos (se houver) */}
                  {comment.attachments && comment.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {comment.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-600 hover:underline flex items-center gap-1"
                        >
                          📎 {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Formulário de novo comentário */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={loading || !newComment.trim()}
          >
            {loading ? (
              'Enviando...'
            ) : (
              <>
                <Send size={14} className="mr-2" />
                Comentar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
