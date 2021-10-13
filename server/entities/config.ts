import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import Link from './link';
import Note from './note';
import Theme from './theme';

@Entity()
export default class Config {
  @PrimaryColumn({ nullable: false, type: 'varchar', length: 200 })
  id!: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  title!: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ default: 4, type: 'int' })
  columns: number;

  @OneToMany(() => Note, note => note.config)
  notes?: Note[];

  @OneToMany(() => Link, link => link.config)
  links?: Link[];

  @OneToMany(() => Theme, theme => theme.config)
  themes?: Theme[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
