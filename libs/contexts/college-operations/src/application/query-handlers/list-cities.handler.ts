import type { ICityRepository } from '../../domain/repositories/city.repository.js';
import type { CityDto } from '../dto/college.dto.js';

export class ListCitiesQueryHandler {
  constructor(private readonly cityRepo: ICityRepository) {}

  async execute(): Promise<CityDto[]> {
    const cities = await this.cityRepo.findAll();
    return cities.map(c => ({ id: c.id, name: c.name, state: c.state }));
  }
}
