
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API, IMAGE_API } from './Companents/Api.js';
import Modal from './Companents/Modal.jsx';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';

const App = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch] = useState('');

  async function getUsers(searchValue = '') {
    try {
      const response = await axios.get(API, {
        params: { search: searchValue },
      });

      setUsers(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteUser(id) {
    try {
      await axios.delete(`${API}?id=${id}`);
      getUsers(search);
    } catch (error) {
      console.log(error);
    }
  }

  async function addUser(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get('Images');

    formData.set('Name', formData.get('Name')?.trim() || '');
    formData.set(
      'Description',
      formData.get('Description')?.trim() || ''
    );
    formData.set('Images', file);
    formData.set('isCompleted', formData.get('Status'));

    try {
      await axios.post(API, formData);

      setOpen(false);
      setImagePreview('');
      e.target.reset();
      getUsers(search);
    } catch (error) {
      console.log(error);
    }
  }

  function EditData(user) {
    setEditData(user);
    setEditOpen(true);

    setImagePreview(
      user.images?.[0]?.imageName
        ? `${IMAGE_API}/${user.images[0].imageName}`
        : ''
    );
  }

  function ViewData(user) {
    setViewData(user);
    setViewOpen(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  async function editUser(e) {
    e.preventDefault();

    if (!editData?.id) {
      console.warn('No user selected for edit.');
      return;
    }

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get('Name')?.trim() || '',
      description: formData.get('Description')?.trim() || '',
      id: editData.id,
      isCompleted: formData.get('Status') === 'true',
    };

    try {
      await axios.put(API, payload);

      setEditOpen(false);
      setImagePreview('');
      setEditData(null);
      getUsers(search);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      getUsers(search);
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row">
          <h1 className="text-2xl font-semibold text-gray-900">
            Пользователи
          </h1>

          <Button
            variant="contained"
            onClick={() => setOpen(true)}
          >
            + Добавить пользователя
          </Button>
        </div>

        <div className="mb-6">
          <input
            className="w-full max-w-sm rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            type="text"
            placeholder="Поиск по имени..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Фото</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((el) => (
                  <TableRow key={el.id}>
                    <TableCell>
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={
                          el.images?.[0]?.imageName
                            ? `${IMAGE_API}/${el.images[0].imageName}`
                            : 'https://placehold.co/50'
                        }
                        alt={el.name || 'User'}
                      />
                    </TableCell>
                    <TableCell>{el.name}</TableCell>
                    <TableCell>{el.description || 'Нет описания'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={el.isCompleted ? 'Неактивен' : 'Активен'}
                        color={el.isCompleted ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="small" variant="outlined" onClick={() => ViewData(el)}>
                          Инфо
                        </Button>
                        <Button size="small" variant="outlined" color="secondary" onClick={() => EditData(el)}>
                          Ред.
                        </Button>
                        <Button size="small" variant="contained" color="error" onClick={() => deleteUser(el.id)}>
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          header="Новый пользователь"
          open={open}
          onClose={() => {
            setOpen(false);
            setImagePreview('');
          }}
          onSave={addUser}
        >
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Имя
              </label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-1.5"
                type="text"
                name="Name"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Описание
              </label>
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-1.5"
                rows="2"
                name="Description"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Фотография
              </label>
              <input
                className="w-full text-xs text-gray-500"
                type="file"
                name="Images"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Статус
              </label>
              <select
                className="w-full rounded border border-gray-300 px-3 py-1.5"
                name="Status"
                defaultValue="false"
              >
                <option value="false">Активен</option>
                <option value="true">Неактивен</option>
              </select>
            </div>

            {imagePreview && (
              <img
                className="mt-1 h-20 w-20 rounded border border-gray-200 object-cover"
                src={imagePreview}
                alt="Предпросмотр"
              />
            )}
          </div>
        </Modal>

        <Modal
          header="Редактирование"
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setImagePreview('');
            setEditData(null);
          }}
          onSave={editUser}
        >
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Имя
              </label>
              <input
                className="w-full rounded border border-gray-300 px-3 py-1.5"
                type="text"
                name="Name"
                defaultValue={editData?.name || ''}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Описание
              </label>
              <textarea
                className="w-full rounded border border-gray-300 px-3 py-1.5"
                rows="2"
                name="Description"
                defaultValue={editData?.description || ''}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Статус
              </label>
              <select
                className="w-full rounded border border-gray-300 bg-white px-3 py-1.5"
                name="Status"
                defaultValue={editData?.isCompleted ? 'true' : 'false'}
              >
                <option value="false">Активен</option>
                <option value="true">Неактивен</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Заменить фото
              </label>
              <input
                className="w-full text-xs text-gray-500"
                type="file"
                name="Images"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            {imagePreview && (
              <img
                className="mt-1 h-20 w-20 rounded border border-gray-200 object-cover"
                src={imagePreview}
                alt="Предпросмотр"
              />
            )}
          </div>
        </Modal>

        <Modal
          header="Информация"
          open={viewOpen}
          onClose={() => {
            setViewOpen(false);
            setViewData(null);
          }}
          onSave={(e) => {
            e.preventDefault();
            setViewOpen(false);
            setViewData(null);
          }}
        >
          {viewData && (
            <div className="flex flex-col items-center text-center text-sm">
              <img
                className="mb-3 h-24 w-24 rounded-full border border-gray-200 object-cover"
                src={
                  viewData.images?.[0]?.imageName
                    ? `${IMAGE_API}/${viewData.images[0].imageName}`
                    : 'https://placehold.co/96'
                }
                alt={viewData.name || 'User'}
              />

              <h3 className="text-lg font-medium text-gray-900">
                {viewData.name}
              </h3>

              <span
                className={`my-2 inline-block rounded-full border px-2 py-0.5 text-xs ${
                  viewData.isCompleted
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-green-200 bg-green-50 text-green-600'
                }`}
              >
                {viewData.isCompleted ? 'Aктивен' : 'Неактивен'}
              </span>

              <p className="mt-1 text-xs text-gray-600">
                {viewData.description || 'Нет описания'}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default App;