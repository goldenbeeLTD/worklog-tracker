const client = [
    {
        path: '/',
        component: () => import('@/layouts/client.vue'),
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('@/pages/clients/home/index.vue'),
            },
            {
                path: '/login',
                name: 'login',
                component: () => import('@/pages/clients/login/index.vue'),
            },
        ]
    }
]

export default client;