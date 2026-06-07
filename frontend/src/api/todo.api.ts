import api from './axios';
import { ApiResponse } from '../types/auth.types';
import { PageResponse } from '../types/group.types';
import { PersonalTodo, Todo, TodoFormData, TodoProgress } from '../types/todo.types';

interface TodoListParams {
  page?: number;
  size?: number;
  completed?: boolean;
}

const toRequestBody = (data: TodoFormData) => ({
  title: data.title,
  description: data.description,
  dueDate: data.dueDate || null,
});

export const fetchTodos = async (
  groupId: number,
  params: TodoListParams = {}
): Promise<ApiResponse<PageResponse<Todo>>> => {
  const response = await api.get(`/api/groups/${groupId}/todos`, { params });
  return response.data;
};

export const fetchTodoProgress = async (
  groupId: number
): Promise<ApiResponse<TodoProgress>> => {
  const response = await api.get(`/api/groups/${groupId}/todos/progress`);
  return response.data;
};

export const fetchTodoDetail = async (
  groupId: number,
  todoId: number
): Promise<ApiResponse<Todo>> => {
  const response = await api.get(`/api/groups/${groupId}/todos/${todoId}`);
  return response.data;
};

export const createTodo = async (
  groupId: number,
  data: TodoFormData
): Promise<ApiResponse<Todo>> => {
  const response = await api.post(`/api/groups/${groupId}/todos`, toRequestBody(data));
  return response.data;
};

export const updateTodo = async (
  groupId: number,
  todoId: number,
  data: TodoFormData
): Promise<ApiResponse<Todo>> => {
  const response = await api.put(`/api/groups/${groupId}/todos/${todoId}`, toRequestBody(data));
  return response.data;
};

export const updateTodoComplete = async (
  groupId: number,
  todoId: number,
  completed: boolean
): Promise<ApiResponse<Todo>> => {
  const response = await api.patch(`/api/groups/${groupId}/todos/${todoId}/complete`, {
    completed,
  });
  return response.data;
};

export const deleteTodo = async (
  groupId: number,
  todoId: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/groups/${groupId}/todos/${todoId}`);
  return response.data;
};

export const fetchPersonalTodos = async (
  params: TodoListParams = {}
): Promise<ApiResponse<PageResponse<Todo>>> => {
  const response = await api.get('/api/todos', { params });
  return response.data;
};

export const fetchPersonalTodoProgress = async (): Promise<ApiResponse<TodoProgress>> => {
  const response = await api.get('/api/todos/progress');
  return response.data;
};

export const fetchPersonalTodoDetail = async (todoId: number): Promise<ApiResponse<PersonalTodo>> => {
  const response = await api.get(`/api/todos/${todoId}`);
  return response.data;
};

export const createPersonalTodo = async (
  data: TodoFormData
): Promise<ApiResponse<PersonalTodo>> => {
  const response = await api.post('/api/todos', toRequestBody(data));
  return response.data;
};

export const updatePersonalTodo = async (
  todoId: number,
  data: TodoFormData
): Promise<ApiResponse<PersonalTodo>> => {
  const response = await api.put(`/api/todos/${todoId}`, toRequestBody(data));
  return response.data;
};

export const updatePersonalTodoComplete = async (
  todoId: number,
  completed: boolean
): Promise<ApiResponse<PersonalTodo>> => {
  const response = await api.patch(`/api/todos/${todoId}/complete`, { completed });
  return response.data;
};

export const deletePersonalTodo = async (todoId: number): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/api/todos/${todoId}`);
  return response.data;
};
