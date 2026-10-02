import { Button } from '@krgaa/react-developer-burger-ui-components';
export const RequestMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): React.JSX.Element => (
  <div className="p-10 text text_type_main-default" role="status">
    <p>{message}</p>
    {onRetry && (
      <Button htmlType="button" type="secondary" onClick={onRetry}>
        Повторить
      </Button>
    )}
  </div>
);
