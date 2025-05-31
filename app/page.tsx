import { redirect } from 'next/navigation';

const HomePage = () => {
	redirect('/admin/posts');
};

export default HomePage;
