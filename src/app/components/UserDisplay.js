import { getUser } from '../lib/data';

export default async function UserDisplay({ query }) {
  // getUser returns an array, but we only want the first item
  const users = await getUser(query);
  const user = users[0]; // Get the first user from the results
  
  // Handle case where no user is found
  if (!user) {
    return (
      <div className="mt-4 p-4 border rounded">
        <p>No user found matching "{query}"</p>
      </div>
    );
  }
  
  // Display a single user
  return (
    <div className="mt-4 max-w-md mx-auto rounded border p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">{user.name}</h2>
      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">{user.role}</span></p>
        <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}