import { revalidatePath } from "next/cache";

import { cookiesClient } from "@/utils/amplify-utils";


async function App() {
  const { data: todos } = await cookiesClient.models.Todo.list();

  async function addTodo(data: FormData) {
    "use server";
    const title = data.get("title") as string;
    await cookiesClient.models.Todo.create({
      content: title,
    });
    revalidatePath("/");
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Hello, Amplify 👋</h1>
      <form action={addTodo} className="mb-8 flex gap-2">
        <input
          type="text"
          name="title"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a new todo..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Todo
        </button>
      </form>

      <ul className="space-y-3">
        {todos &&
          todos.map((todo) => (
            <li
              key={todo.id}
              className="p-4 bg-white rounded-lg shadow border border-gray-200"
            >
              {todo.content}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;