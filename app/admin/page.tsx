'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats, usePosts, useUsers } from '@/hooks/api';
import { BarChart3, FileText, Users, Eye, ThumbsUp } from 'lucide-react';

export default function AdminDashboard() {
	const { data: stats } = useStats();
	const { data: recentPosts } = usePosts({ limit: 5, sortBy: 'createdAt' });
	const { data: recentUsers } = useUsers({ limit: 5, sortBy: 'createdAt' });

	const dashboardStats = [
		{
			title: 'Total Posts',
			value: stats?.posts?.total || 0,
			icon: FileText,
			color: 'text-blue-600',
		},
		{
			title: 'Total Users',
			value: stats?.users?.total || 0,
			icon: Users,
			color: 'text-green-600',
		},
		{
			title: 'Total Views',
			value: stats?.engagement?.totalViews || 0,
			icon: Eye,
			color: 'text-purple-600',
		},
		{
			title: 'Total Likes',
			value: stats?.engagement?.totalLikes || 0,
			icon: ThumbsUp,
			color: 'text-red-600',
		},
	];

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<p className='text-muted-foreground'>Welcome to your forum admin dashboard</p>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{dashboardStats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>{stat.value.toLocaleString()}</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				{/* Recent Posts */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Posts</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-4'>
							{recentPosts?.data.map((post) => (
								<div key={post.id} className='flex items-start space-x-4'>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium truncate'>
											{/* {user.displayName || user.username} */}
										</p>
										<p className='text-xs text-muted-foreground'>
											{/* {new Date(user.createdAt).toLocaleDateString()} • {user.role} */}
										</p>
									</div>
									<div className='flex items-center space-x-2 text-xs text-muted-foreground'>
										<FileText className='h-3 w-3' />
										{/* <span>{user.postCount}</span> */}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
