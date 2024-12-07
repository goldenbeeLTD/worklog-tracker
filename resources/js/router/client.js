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
        ]
    }
]

export default client;