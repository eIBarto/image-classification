"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  function listTodos() {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  useEffect(() => {
    listTodos();
  }, []);

  function createTodo() {
    client.models.Todo.create({
      content: window.prompt("Todo content"),
    });
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">My todos</h1>
      <button 
        onClick={createTodo}
        className="mb-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <span>+</span> New Todo
      </button>
      <ul className="space-y-3 mb-8">
        {todos.map((todo) => (
          <li 
            key={todo.id}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            {todo.content}
          </li>
        ))}
      </ul>
      <div className="text-center text-gray-600 border-t pt-8">
        <p className="mb-2">🥳 App successfully hosted. Try creating a new todo.</p>
        <a 
          href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Review next steps of this tutorial.
        </a>
      </div>
    </main>
  );
}
