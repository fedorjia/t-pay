# Mongo Scripts

## 创建APP
```
db.apps.save({
    name: 'My APP',
    desc: 'My APP Descrition',
    created_at: new Date(),
    updated_at: new Date(),
    config: {}
});
```

## 删除APP
```
db.apps.remove({_id: ObjectId("your-appid")});
```

## APP 列表
db.apps.find().pretty();
