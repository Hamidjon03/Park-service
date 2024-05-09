import { createConnection, DataSource } from 'typeorm';
import { connectionSource } from 'src/common/config/database.config';
import { ParkEntity } from 'src/modules/park/entities/park.entity';
import { LayerEntity } from 'src/modules/layer/entities/layer.entity';
import { PlaceEntity } from 'src/modules/place/entities/place.entity';
import { ServiceEntity } from 'src/modules/service/entities/service.entity';
import { TariffEntity } from 'src/modules/tariff/entities/tariff.entity';

(async () => {
  const datasource: DataSource = await createConnection(connectionSource);

  const queryRunner = datasource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const parkRepository = queryRunner.manager.getRepository(ParkEntity);
    const layerRepository = queryRunner.manager.getRepository(LayerEntity);
    const placeRepository = queryRunner.manager.getRepository(PlaceEntity);
    const serviceRepository = queryRunner.manager.getRepository(ServiceEntity);
    const tariffRepository = queryRunner.manager.getRepository(TariffEntity);

    const park = await parkRepository.find();
    await parkRepository.remove(park);
    const layer = await layerRepository.find();
    await layerRepository.remove(layer);
    const place = await placeRepository.find();
    await placeRepository.remove(place);
    const service = await serviceRepository.find();
    await serviceRepository.remove(service);
    const tariff = await tariffRepository.find();
    await tariffRepository.remove(tariff);

    let park1 = parkRepository.create({ name: 'parking', owner: 2, image: 2 });
    park1 = await parkRepository.save(park1);

    let layer1 = layerRepository.create({
      name: 'premium',
      floor: 1,
      parkId: park1.id,
    });
    layer1 = await layerRepository.save(layer1);

    let place1 = placeRepository.create({
      name: 'pro',
      layerId: layer1.id,
      price: 35000,
    });
    place1 = await placeRepository.save(place1);

    let tariff1 = tariffRepository.create({
      name: '50',
      parkId: park1.id,
      price: 50000,
      time: 12,
    });
    tariff1 = await tariffRepository.save(tariff1);

    let service1 = serviceRepository.create({
      parkId: park1.id,
      userId: 1,
      startedAt: '2024-05-10',
      endedAt: '2024-05-14',
      price: 50000,
      tariffId: tariff1.id,
    });
    service1 = await serviceRepository.save(service1);

    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
})();
