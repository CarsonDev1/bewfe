import { redirect } from 'next/navigation';

const AdminPage = () => {
	redirect('/admin/posts');
};

export default AdminPage;
