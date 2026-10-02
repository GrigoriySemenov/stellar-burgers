import { Link } from 'react-router-dom';
export const NotFound404 = (): React.JSX.Element => (
  <main className="p-10">
    <h1 className="text text_type_main-large pb-6">Страница не найдена. Ошибка 404.</h1>
    <Link to="/" className="text text_type_main-default">
      Вернуться к конструктору
    </Link>
  </main>
);
