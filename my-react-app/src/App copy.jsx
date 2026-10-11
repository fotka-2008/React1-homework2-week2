
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API, IMAGE_API } from './API.js';
import Modal from './Modal.jsx';

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

          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => setOpen(true)}
          >
            + Добавить пользователя
          </button>
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

        {filteredUsers.length === 0 ? (
          <div className="rounded-md border border-gray-200 bg-white py-12 text-center text-sm text-gray-500">
            Пользователи не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredUsers.map((el) => (
              <div
                key={el.id}
                className="flex flex-col justify-between rounded-md border border-gray-200 bg-white p-4"
              >
                <div>
                  <h2 className="mb-3 text-center font-medium text-gray-900">
                    {el.name}
                  </h2>

                  <img
                    className="mx-auto mb-3 h-20 w-20 rounded-full border border-gray-100 object-cover"
                    src={
                      el.images?.[0]?.imageName
                        ? `${IMAGE_API}/${el.images[0].imageName}`
                        : 'https://placehold.co/80'
                    }
                    alt={el.name || 'User'}
                  />

                  <p className="mb-4 line-clamp-2 text-center text-xs text-gray-500">
                    {el.description || 'Нет описания'}
                  </p>
                </div>

                <div className="flex gap-2 border-t border-gray-100 pt-3 text-xs">
                  <button
                    className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200"
                    onClick={() => ViewData(el)}
                  >
                    Инфо
                  </button>

                  <button
                    className="flex-1 rounded bg-gray-100 py-1.5 text-gray-700 hover:bg-gray-200"
                    onClick={() => EditData(el)}
                  >
                    Ред.
                  </button>

                  <button
                    className="flex-1 rounded bg-red-50 py-1.5 text-red-600 hover:bg-red-100"
                    onClick={() => deleteUser(el.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
                {viewData.isCompleted ? 'Неактивен' : 'Активен'}
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