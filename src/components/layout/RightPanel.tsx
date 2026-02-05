import MessageList from '../chat/MessageList';
import EmptyState from '../common/EmptyState';
import { useAppSelector } from '../../store/hooks';

export default function RightPanel() {
  const selectedChatId = useAppSelector((state) => state.ui.selectedChatId);

  if (!selectedChatId) {
    return <EmptyState message="Select a chat to view messages" />;
  }

  return <MessageList />;
}
