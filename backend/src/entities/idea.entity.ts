import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  Unique,
} from 'typeorm';
import { User } from 'src/entities/user.entity';

@Entity()
@Unique(['name', 'creator'])
export class Idea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' }) // Eager loading automatically loads the creator
  creator: User;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.followedIdeas)
  followers: User[];
}
